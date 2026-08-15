import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuota, Parametro } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { AnularCuotaDto, CreateCuotaDto, PagarCuotaDto } from './dto/cuota.dto';

/** Cuotas institucionales (seccion 7 del pedido). No todos los
 * bomberos necesariamente pagan cuota -- esta tabla solo tiene filas
 * para quien realmente tenga una cuota asignada, nunca se infiere. */
@Injectable()
export class CuotasService {
  constructor(
    @InjectRepository(Cuota) private readonly repo: Repository<Cuota>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly movimientosService: MovimientosFinancierosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { bomberoId?: string; periodo?: string; estado?: string }) {
    const qb = this.repo.createQueryBuilder('c').orderBy('c.periodo', 'DESC');
    if (filtros.bomberoId) qb.andWhere('c.bomberoId = :bomberoId', { bomberoId: filtros.bomberoId });
    if (filtros.periodo) qb.andWhere('c.periodo = :periodo', { periodo: filtros.periodo });
    if (filtros.estado) qb.andWhere('c.estado = :estado', { estado: filtros.estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const cuota = await this.repo.findOne({ where: { id } });
    if (!cuota) throw new NotFoundException(`Cuota ${id} no encontrada`);
    return cuota;
  }

  async create(dto: CreateCuotaDto, actorId: string, ip?: string) {
    const existente = await this.repo.findOne({ where: { bomberoId: dto.bomberoId, periodo: dto.periodo } });
    if (existente) throw new ConflictException(`Ya existe una cuota de ${dto.periodo} para este bombero`);

    const cuota = await this.repo.save(
      this.repo.create({
        bomberoId: dto.bomberoId,
        periodo: dto.periodo,
        importe: dto.importe,
        fechaVencimiento: dto.fechaVencimiento ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.cuotas',
      recursoId: cuota.id,
      datosDespues: cuota,
      ip: ip ?? null,
    });
    return cuota;
  }

  async pagar(id: string, dto: PagarCuotaDto, actorId: string, ip?: string) {
    const cuota = await this.findOne(id);
    if (cuota.estado === 'PAGADA') throw new BadRequestException('Esta cuota ya esta completamente pagada');
    if (cuota.estado === 'ANULADA' || cuota.estado === 'EXONERADA') throw new BadRequestException(`Esta cuota esta ${cuota.estado.toLowerCase()}, no admite pagos`);
    if (!dto.cajaId && !dto.cuentaBancariaId) throw new BadRequestException('Debe indicarse caja o cuenta bancaria para el pago');

    const pendiente = cuota.importe - cuota.importePagado;
    const importePago = dto.importe ?? pendiente;
    if (importePago > pendiente + 0.009) throw new BadRequestException(`El importe (${importePago}) supera el saldo pendiente de la cuota (${pendiente})`);

    const tipoIngresoCuota = await this.parametroRepo.findOne({ where: { tipo: 'TIPO_INGRESO_FINANZAS', nombre: 'Cuotas' } });
    if (!tipoIngresoCuota) throw new NotFoundException("Parametro 'Cuotas' (tipo TIPO_INGRESO_FINANZAS) no encontrado");

    const movimiento = await this.movimientosService.registrar(
      {
        tipo: 'INGRESO',
        fecha: dto.fecha,
        tipoIngresoId: tipoIngresoCuota.id,
        concepto: `Cuota ${cuota.periodo}`,
        importe: importePago,
        cajaId: dto.cajaId,
        cuentaBancariaId: dto.cuentaBancariaId,
        bomberoId: cuota.bomberoId,
        responsableId: dto.responsableId,
        cuotaId: cuota.id,
        observacion: dto.observacion,
        documento: dto.documento,
      },
      actorId,
      ip,
    );

    const importePagado = cuota.importePagado + importePago;
    const nuevoEstado = importePagado >= cuota.importe ? 'PAGADA' : 'PARCIAL';
    await this.repo.update(id, { importePagado, estado: nuevoEstado, movimientoId: movimiento.id });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'PAGAR',
      recurso: 'finanzas.cuotas',
      recursoId: id,
      datosAntes: cuota,
      datosDespues: { importePagado, estado: nuevoEstado, movimientoId: movimiento.id },
      ip: ip ?? null,
    });

    return this.findOne(id);
  }

  async anular(id: string, dto: AnularCuotaDto, actorId: string, ip?: string) {
    const cuota = await this.findOne(id);
    if (cuota.estado === 'PAGADA' || cuota.estado === 'PARCIAL') {
      throw new BadRequestException('Esta cuota ya tiene pagos registrados -- anule el/los movimientos en vez de la cuota');
    }
    await this.repo.update(id, { estado: 'ANULADA', observacion: dto.motivo });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR',
      recurso: 'finanzas.cuotas',
      recursoId: id,
      datosAntes: cuota,
      datosDespues: { estado: 'ANULADA', motivo: dto.motivo },
      ip: ip ?? null,
    });
    return this.findOne(id);
  }

  async exonerar(id: string, dto: AnularCuotaDto, actorId: string, ip?: string) {
    const cuota = await this.findOne(id);
    if (cuota.estado === 'PAGADA' || cuota.estado === 'PARCIAL') {
      throw new BadRequestException('Esta cuota ya tiene pagos registrados, no puede exonerarse');
    }
    await this.repo.update(id, { estado: 'EXONERADA', observacion: dto.motivo });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EXONERAR',
      recurso: 'finanzas.cuotas',
      recursoId: id,
      datosAntes: cuota,
      datosDespues: { estado: 'EXONERADA', motivo: dto.motivo },
      ip: ip ?? null,
    });
    return this.findOne(id);
  }
}
