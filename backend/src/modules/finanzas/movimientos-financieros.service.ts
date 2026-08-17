import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Caja, CuentaBancaria, DocumentoRespaldo, MovimientoFinanciero, Parametro, TurnoCaja } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { EjerciciosFiscalesService } from './ejercicios-fiscales.service';
import { AnularMovimientoFinancieroDto, RegistrarMovimientoFinancieroDto } from './dto/movimiento-financiero.dto';

/** Motor central de trazabilidad de Finanzas (seccion 2 del pedido):
 * cada movimiento crea SIEMPRE una fila de historial
 * (finanzas.movimientos_financieros) y actualiza el saldo de la
 * caja/cuenta en la misma transaccion -- nunca se edita un saldo por
 * fuera de este flujo. El importe de un movimiento ya registrado nunca
 * se edita: se anula (estado + motivo + usuario + fecha) y revierte el
 * saldo. */
@Injectable()
export class MovimientosFinancierosService {
  constructor(
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CuentaBancaria) private readonly cuentaRepo: Repository<CuentaBancaria>,
    @InjectRepository(TurnoCaja) private readonly turnoRepo: Repository<TurnoCaja>,
    @InjectRepository(DocumentoRespaldo) private readonly documentoRepo: Repository<DocumentoRespaldo>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly ejerciciosService: EjerciciosFiscalesService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /** Filas planas para exportacion Excel/PDF (seccion 24 del pedido) --
   * resuelve los nombres de caja/cuenta/clasificacion en vez de
   * exponer GUIDs crudos en el reporte. */
  async filasExportables(filtros: Parameters<MovimientosFinancierosService['findAll']>[0]) {
    const movimientos = await this.findAll(filtros);
    if (movimientos.length === 0) return [];

    const idsParametros = [...new Set(movimientos.map((m) => m.tipoIngresoId ?? m.categoriaEgresoId).filter((id): id is string => !!id))];
    const idsCajas = [...new Set(movimientos.map((m) => m.cajaId).filter((id): id is string => !!id))];
    const idsCuentas = [...new Set(movimientos.map((m) => m.cuentaBancariaId).filter((id): id is string => !!id))];

    const [parametros, cajas, cuentas] = await Promise.all([
      idsParametros.length ? this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: idsParametros }).getMany() : [],
      idsCajas.length ? this.cajaRepo.createQueryBuilder('c').where('c.id IN (:...ids)', { ids: idsCajas }).getMany() : [],
      idsCuentas.length ? this.cuentaRepo.createQueryBuilder('c').where('c.id IN (:...ids)', { ids: idsCuentas }).getMany() : [],
    ]);
    const nombreParametro = new Map(parametros.map((p): [string, string] => [p.id, p.nombre]));
    const nombreCaja = new Map(cajas.map((c): [string, string] => [c.id, c.nombre]));
    const nombreCuenta = new Map(cuentas.map((c): [string, string] => [c.id, `${c.banco} - ${c.numeroCuenta}`]));

    return movimientos.map((m) => ({
      Fecha: m.fecha,
      Tipo: m.tipo,
      Clasificacion: nombreParametro.get(m.tipoIngresoId ?? m.categoriaEgresoId ?? '') ?? '',
      Concepto: m.concepto,
      Importe: m.importe,
      'Caja/Cuenta': m.cajaId ? nombreCaja.get(m.cajaId) ?? '' : nombreCuenta.get(m.cuentaBancariaId ?? '') ?? '',
      Estado: m.estado,
    }));
  }

  findAll(filtros: {
    tipo?: string;
    estado?: string;
    cajaId?: string;
    cuentaBancariaId?: string;
    proveedorId?: string;
    bomberoId?: string;
    socioProtectorId?: string;
    tipoIngresoId?: string;
    categoriaEgresoId?: string;
    desde?: string;
    hasta?: string;
  }) {
    const qb = this.movimientoRepo.createQueryBuilder('m').orderBy('m.fecha', 'DESC').addOrderBy('m.creadoEn', 'DESC');
    if (filtros.tipo) qb.andWhere('m.tipo = :tipo', { tipo: filtros.tipo });
    if (filtros.estado) qb.andWhere('m.estado = :estado', { estado: filtros.estado });
    if (filtros.cajaId) qb.andWhere('m.cajaId = :cajaId', { cajaId: filtros.cajaId });
    if (filtros.cuentaBancariaId) qb.andWhere('m.cuentaBancariaId = :cuentaBancariaId', { cuentaBancariaId: filtros.cuentaBancariaId });
    if (filtros.proveedorId) qb.andWhere('m.proveedorId = :proveedorId', { proveedorId: filtros.proveedorId });
    if (filtros.bomberoId) qb.andWhere('m.bomberoId = :bomberoId', { bomberoId: filtros.bomberoId });
    if (filtros.socioProtectorId) qb.andWhere('m.socioProtectorId = :socioProtectorId', { socioProtectorId: filtros.socioProtectorId });
    if (filtros.tipoIngresoId) qb.andWhere('m.tipoIngresoId = :tipoIngresoId', { tipoIngresoId: filtros.tipoIngresoId });
    if (filtros.categoriaEgresoId) qb.andWhere('m.categoriaEgresoId = :categoriaEgresoId', { categoriaEgresoId: filtros.categoriaEgresoId });
    if (filtros.desde) qb.andWhere('m.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('m.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: string) {
    const movimiento = await this.movimientoRepo.findOne({ where: { id } });
    if (!movimiento) throw new NotFoundException(`Movimiento ${id} no encontrado`);
    return movimiento;
  }

  documentoDe(movimientoId: string) {
    return this.documentoRepo.findOne({ where: { movimientoId } });
  }

  async registrar(dto: RegistrarMovimientoFinancieroDto, actorId: string, ip?: string): Promise<MovimientoFinanciero> {
    if (dto.tipo === 'INGRESO' && !dto.tipoIngresoId) throw new BadRequestException('tipoIngresoId es requerido cuando tipo=INGRESO');
    if (dto.tipo === 'EGRESO' && !dto.categoriaEgresoId) throw new BadRequestException('categoriaEgresoId es requerido cuando tipo=EGRESO');
    if (!dto.cajaId && !dto.cuentaBancariaId) throw new BadRequestException('Debe indicarse caja o cuenta bancaria');
    if (dto.cajaId && dto.cuentaBancariaId) throw new BadRequestException('Indique caja o cuenta bancaria, no ambas');

    const ejercicio = await this.ejerciciosService.resolverParaFecha(dto.fecha);

    let caja: Caja | null = null;
    let turno: TurnoCaja | null = null;
    if (dto.cajaId) {
      caja = await this.cajaRepo.findOne({ where: { id: dto.cajaId } });
      if (!caja) throw new NotFoundException(`Caja ${dto.cajaId} no encontrada`);
      turno = await this.turnoRepo.findOne({ where: { cajaId: dto.cajaId, estado: 'ABIERTO' } });
    }
    if (dto.cuentaBancariaId) {
      const cuenta = await this.cuentaRepo.findOne({ where: { id: dto.cuentaBancariaId } });
      if (!cuenta) throw new NotFoundException(`Cuenta bancaria ${dto.cuentaBancariaId} no encontrada`);
    }

    const movimiento = await this.movimientoRepo.manager.transaction(async (manager) => {
      const guardado = await manager.save(
        MovimientoFinanciero,
        manager.create(MovimientoFinanciero, {
          tipo: dto.tipo as any,
          fecha: dto.fecha,
          tipoIngresoId: dto.tipo === 'INGRESO' ? dto.tipoIngresoId : null,
          categoriaEgresoId: dto.tipo === 'EGRESO' ? dto.categoriaEgresoId : null,
          concepto: dto.concepto,
          importe: dto.importe,
          cajaId: dto.cajaId ?? null,
          cuentaBancariaId: dto.cuentaBancariaId ?? null,
          turnoCajaId: turno?.id ?? null,
          proveedorId: dto.proveedorId ?? null,
          bomberoId: dto.bomberoId ?? null,
          entidadExterna: dto.entidadExterna ?? null,
          responsableId: dto.responsableId ?? null,
          cuotaId: dto.cuotaId ?? null,
          depositoEntradaId: dto.depositoEntradaId ?? null,
          socioProtectorId: dto.socioProtectorId ?? null,
          aporteId: dto.aporteId ?? null,
          facturaId: dto.facturaId ?? null,
          ejercicioId: ejercicio.id,
          observacion: dto.observacion ?? null,
          creadoPor: actorId,
        }),
      );

      await this.aplicarSaldo(manager, guardado, 1);

      if (dto.documento) {
        await manager.save(
          DocumentoRespaldo,
          manager.create(DocumentoRespaldo, {
            movimientoId: guardado.id,
            tipoDocumentoId: dto.documento.tipoDocumentoId,
            numero: dto.documento.numero ?? null,
            timbrado: dto.documento.timbrado ?? null,
            fecha: dto.documento.fecha ?? null,
            proveedorId: dto.documento.proveedorId ?? dto.proveedorId ?? null,
            importe: dto.documento.importe ?? dto.importe,
            archivoUrl: dto.documento.archivoUrl ?? null,
            observacion: dto.documento.observacion ?? null,
            creadoPor: actorId,
          }),
        );
      }

      return guardado;
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGISTRAR_MOVIMIENTO',
      recurso: 'finanzas.movimientos_financieros',
      recursoId: movimiento.id,
      datosDespues: movimiento,
      ip: ip ?? null,
    });

    return movimiento;
  }

  /** Anula un movimiento (seccion 20: nunca se elimina fisicamente) y
   * revierte su efecto sobre el saldo de la caja/cuenta en la misma
   * transaccion. */
  async anular(id: string, dto: AnularMovimientoFinancieroDto, actorId: string, ip?: string) {
    const movimiento = await this.findOne(id);
    if (movimiento.estado === 'ANULADO') throw new BadRequestException('Este movimiento ya esta anulado');

    await this.movimientoRepo.manager.transaction(async (manager) => {
      await this.aplicarSaldo(manager, movimiento, -1);
      await manager.update(MovimientoFinanciero, id, {
        estado: 'ANULADO',
        anuladoPor: actorId,
        fechaAnulacion: new Date(),
        motivoAnulacionId: dto.motivoAnulacionId,
        motivoAnulacionDetalle: dto.motivoAnulacionDetalle ?? null,
      });
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR',
      recurso: 'finanzas.movimientos_financieros',
      recursoId: id,
      datosAntes: movimiento,
      datosDespues: { estado: 'ANULADO', motivoAnulacionId: dto.motivoAnulacionId },
      ip: ip ?? null,
    });

    return this.findOne(id);
  }

  /** signo = 1 al registrar, -1 al anular (revierte). INGRESO suma al
   * saldo, EGRESO resta -- multiplicado por el signo de la operacion. */
  private async aplicarSaldo(manager: EntityManager, movimiento: MovimientoFinanciero, signo: 1 | -1) {
    const delta = (movimiento.tipo === 'INGRESO' ? 1 : -1) * signo * movimiento.importe;
    if (movimiento.cajaId) {
      await manager.increment(Caja, { id: movimiento.cajaId }, 'saldoActual', delta);
    } else if (movimiento.cuentaBancariaId) {
      await manager.increment(CuentaBancaria, { id: movimiento.cuentaBancariaId }, 'saldoActual', delta);
    }
  }
}
