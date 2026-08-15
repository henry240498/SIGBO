import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntradaDeposito, MovimientoFinanciero, Parametro } from '../../shared/entities';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { RegistrarDesdeEntradaDepositoDto } from './dto/integracion-finanzas.dto';

/** Integracion con Deposito (secciones 16-17 del pedido): cuando
 * Deposito registra una compra o una donacion, Finanzas puede generar
 * el movimiento monetario correspondiente SIN reingresar los items --
 * solo referencia deposito.entradas.id (`depositoEntradaId`). Nunca
 * duplica la ficha de proveedor ni el detalle de items, que siguen
 * viviendo exclusivamente en Deposito. */
@Injectable()
export class IntegracionFinanzasService {
  constructor(
    @InjectRepository(EntradaDeposito) private readonly entradaRepo: Repository<EntradaDeposito>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    private readonly movimientosService: MovimientosFinancierosService,
  ) {}

  /** Entradas de Deposito (compra/donacion) que todavia no tienen un
   * movimiento financiero asociado -- lo que el Tesorero deberia
   * revisar para no dejar valor sin registrar. */
  async entradasSinRegistrarEnFinanzas() {
    const [tipoCompra, tipoDonacion] = await Promise.all([
      this.parametroRepo.findOne({ where: { tipo: 'TIPO_MOVIMIENTO_DEPOSITO', nombre: 'Compra' } }),
      this.parametroRepo.findOne({ where: { tipo: 'TIPO_MOVIMIENTO_DEPOSITO', nombre: 'Donacion' } }),
    ]);
    const tipoIds = [tipoCompra?.id, tipoDonacion?.id].filter((id): id is string => !!id);
    if (tipoIds.length === 0) return [];

    const yaRegistradas = await this.movimientoRepo
      .createQueryBuilder('m')
      .select('m.depositoEntradaId', 'id')
      .where('m.depositoEntradaId IS NOT NULL')
      .getRawMany<{ id: string }>();
    const idsRegistrados = new Set(yaRegistradas.map((r) => r.id));

    const qb = this.entradaRepo.createQueryBuilder('e').where('e.tipoEntradaId IN (:...tipoIds)', { tipoIds }).orderBy('e.fecha', 'DESC');
    const entradas = await qb.getMany();
    return entradas.filter((e) => !idsRegistrados.has(e.id));
  }

  /** Genera el movimiento financiero (egreso si es compra, ingreso si
   * es donacion) a partir de una entrada de Deposito ya existente. */
  async registrarDesdeEntradaDeposito(entradaId: string, dto: RegistrarDesdeEntradaDepositoDto, actorId: string, ip?: string) {
    const entrada = await this.entradaRepo.findOne({ where: { id: entradaId } });
    if (!entrada) throw new NotFoundException(`Entrada de deposito ${entradaId} no encontrada`);

    const yaRegistrada = await this.movimientoRepo.findOne({ where: { depositoEntradaId: entradaId } });
    if (yaRegistrada) throw new BadRequestException('Esta entrada ya tiene un movimiento financiero asociado');

    if (!entrada.valorTotal || entrada.valorTotal <= 0) {
      throw new BadRequestException('Esta entrada de deposito no tiene un valorTotal cargado -- edite la entrada en Deposito antes de registrar su valor en Finanzas');
    }

    const tipoEntrada = await this.parametroRepo.findOne({ where: { id: entrada.tipoEntradaId } });
    const esDonacion = tipoEntrada?.nombre === 'Donacion';
    const esCompra = tipoEntrada?.nombre === 'Compra';
    if (!esDonacion && !esCompra) {
      throw new BadRequestException(`El tipo de entrada '${tipoEntrada?.nombre ?? entrada.tipoEntradaId}' no se integra automaticamente con Finanzas (solo Compra/Donacion)`);
    }

    if (esCompra) {
      const categoriaEquipamiento = await this.parametroRepo.findOne({ where: { tipo: 'CATEGORIA_EGRESO_FINANZAS', nombre: 'Equipamiento' } });
      if (!categoriaEquipamiento) throw new NotFoundException("Parametro 'Equipamiento' (tipo CATEGORIA_EGRESO_FINANZAS) no encontrado");
      return this.movimientosService.registrar(
        {
          tipo: 'EGRESO',
          fecha: dto.fecha,
          categoriaEgresoId: categoriaEquipamiento.id,
          concepto: `Compra (Deposito) ${entrada.numeroDocumento ?? ''}`.trim(),
          importe: entrada.valorTotal,
          cajaId: dto.cajaId,
          cuentaBancariaId: dto.cuentaBancariaId,
          proveedorId: entrada.proveedorId ?? undefined,
          responsableId: dto.responsableId,
          depositoEntradaId: entrada.id,
          observacion: 'Generado automaticamente desde Deposito > Entradas',
        },
        actorId,
        ip,
      );
    }

    const tipoIngresoDonacion = await this.parametroRepo.findOne({ where: { tipo: 'TIPO_INGRESO_FINANZAS', nombre: 'Donaciones' } });
    if (!tipoIngresoDonacion) throw new NotFoundException("Parametro 'Donaciones' (tipo TIPO_INGRESO_FINANZAS) no encontrado");
    return this.movimientosService.registrar(
      {
        tipo: 'INGRESO',
        fecha: dto.fecha,
        tipoIngresoId: tipoIngresoDonacion.id,
        concepto: `Donacion (Deposito) - valor estimado ${entrada.donanteNombre ? 'de ' + entrada.donanteNombre : ''}`.trim(),
        importe: entrada.valorTotal,
        cajaId: dto.cajaId,
        cuentaBancariaId: dto.cuentaBancariaId,
        entidadExterna: entrada.donanteNombre ?? undefined,
        responsableId: dto.responsableId,
        depositoEntradaId: entrada.id,
        observacion: 'Valor estimado -- generado automaticamente desde Deposito > Entradas',
      },
      actorId,
      ip,
    );
  }
}
