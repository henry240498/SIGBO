import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenPago } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { EjerciciosFiscalesService } from './ejercicios-fiscales.service';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import {
  AnularOrdenPagoDto,
  CreateOrdenPagoDto,
  PagarOrdenPagoDto,
  RechazarOrdenPagoDto,
} from './dto/orden-pago.dto';

type EstadoOrdenPago = OrdenPago['estado'];

/** Maquina de estados de una orden de pago (seccion 18 del pedido):
 * BORRADOR -> SOLICITADO -> PENDIENTE_AUTORIZACION -> AUTORIZADO ->
 * PAGADO, con ramas RECHAZADO (vuelve a BORRADOR) y ANULADO. Mismo
 * patron que servicios.comunicaciones_servicio: mapa de transiciones
 * explicito validado centralmente, permiso distinto por transicion
 * (quien solicita no es quien autoriza), motivo obligatorio en
 * transiciones negativas, `version` para optimistic locking (evita que
 * dos personas autoricen/rechacen la misma orden a la vez). */
const TRANSICIONES: Record<EstadoOrdenPago, EstadoOrdenPago[]> = {
  BORRADOR: ['SOLICITADO', 'ANULADO'],
  SOLICITADO: ['PENDIENTE_AUTORIZACION', 'ANULADO'],
  PENDIENTE_AUTORIZACION: ['AUTORIZADO', 'RECHAZADO', 'ANULADO'],
  AUTORIZADO: ['PAGADO', 'ANULADO'],
  RECHAZADO: ['BORRADOR'],
  PAGADO: [],
  ANULADO: [],
};

@Injectable()
export class OrdenesPagoService {
  constructor(
    @InjectRepository(OrdenPago) private readonly repo: Repository<OrdenPago>,
    private readonly ejerciciosService: EjerciciosFiscalesService,
    private readonly movimientosService: MovimientosFinancierosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    const qb = this.repo.createQueryBuilder('o').orderBy('o.creadoEn', 'DESC');
    if (estado) qb.andWhere('o.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const orden = await this.repo.findOne({ where: { id } });
    if (!orden) throw new NotFoundException(`Orden de pago ${id} no encontrada`);
    return orden;
  }

  private asegurarTransicion(orden: OrdenPago, destino: EstadoOrdenPago) {
    const permitidas = TRANSICIONES[orden.estado];
    if (!permitidas.includes(destino)) {
      throw new ConflictException(`No se puede pasar de ${orden.estado} a ${destino}`);
    }
  }

  private async verificarVersion(id: string, version: number): Promise<OrdenPago> {
    const orden = await this.findOne(id);
    if (orden.version !== version) {
      throw new ConflictException('Esta orden de pago fue modificada por otro usuario -- recargue e intente de nuevo');
    }
    return orden;
  }

  async create(dto: CreateOrdenPagoDto, actorId: string, ip?: string) {
    const ejercicio = await this.ejerciciosService.resolverParaFecha(new Date().toISOString().slice(0, 10));

    const orden = await this.repo.save(
      this.repo.create({
        concepto: dto.concepto,
        importe: dto.importe,
        categoriaEgresoId: dto.categoriaEgresoId,
        proveedorId: dto.proveedorId ?? null,
        ejercicioId: ejercicio.id,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.ordenes_pago',
      recursoId: orden.id,
      datosDespues: orden,
      ip: ip ?? null,
    });
    return orden;
  }

  async solicitar(id: string, dto: { version: number }, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'SOLICITADO');
    await this.repo.update(id, {
      estado: 'SOLICITADO',
      solicitadoPor: actorId,
      fechaSolicitud: new Date(),
      version: orden.version + 1,
    });
    await this.registrarTransicion(orden, 'SOLICITADO', actorId, ip);
    return this.findOne(id);
  }

  async enviarAutorizacion(id: string, dto: { version: number }, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'PENDIENTE_AUTORIZACION');
    await this.repo.update(id, { estado: 'PENDIENTE_AUTORIZACION', version: orden.version + 1 });
    await this.registrarTransicion(orden, 'PENDIENTE_AUTORIZACION', actorId, ip);
    return this.findOne(id);
  }

  async autorizar(id: string, dto: { version: number }, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'AUTORIZADO');
    await this.repo.update(id, {
      estado: 'AUTORIZADO',
      autorizadoPor: actorId,
      fechaAutorizacion: new Date(),
      version: orden.version + 1,
    });
    await this.registrarTransicion(orden, 'AUTORIZADO', actorId, ip);
    return this.findOne(id);
  }

  async rechazar(id: string, dto: RechazarOrdenPagoDto, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'RECHAZADO');
    await this.repo.update(id, {
      estado: 'RECHAZADO',
      rechazadoPor: actorId,
      fechaRechazo: new Date(),
      motivoRechazo: dto.motivo,
      version: orden.version + 1,
    });
    await this.registrarTransicion(orden, 'RECHAZADO', actorId, ip, dto.motivo);
    return this.findOne(id);
  }

  async reabrir(id: string, dto: { version: number }, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'BORRADOR');
    await this.repo.update(id, { estado: 'BORRADOR', version: orden.version + 1 });
    await this.registrarTransicion(orden, 'BORRADOR', actorId, ip);
    return this.findOne(id);
  }

  async anular(id: string, dto: AnularOrdenPagoDto, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'ANULADO');
    await this.repo.update(id, {
      estado: 'ANULADO',
      anuladoPor: actorId,
      fechaAnulacion: new Date(),
      motivoAnulacion: dto.motivo,
      version: orden.version + 1,
    });
    await this.registrarTransicion(orden, 'ANULADO', actorId, ip, dto.motivo);
    return this.findOne(id);
  }

  /** Transicion final: genera el egreso real en
   * finanzas.movimientos_financieros y lo enlaza -- la orden es la
   * autorizacion, el movimiento es el hecho economico consumado. */
  async pagar(id: string, dto: PagarOrdenPagoDto, actorId: string, ip?: string) {
    const orden = await this.verificarVersion(id, dto.version);
    this.asegurarTransicion(orden, 'PAGADO');
    if (!dto.cajaId && !dto.cuentaBancariaId) throw new BadRequestException('Debe indicarse caja o cuenta bancaria para pagar');

    const movimiento = await this.movimientosService.registrar(
      {
        tipo: 'EGRESO',
        fecha: dto.fecha,
        categoriaEgresoId: orden.categoriaEgresoId,
        concepto: orden.concepto,
        importe: orden.importe,
        cajaId: dto.cajaId,
        cuentaBancariaId: dto.cuentaBancariaId,
        proveedorId: orden.proveedorId ?? undefined,
        responsableId: dto.responsableId,
        observacion: `Orden de pago ${orden.id}`,
      },
      actorId,
      ip,
    );

    await this.repo.update(id, {
      estado: 'PAGADO',
      movimientoId: movimiento.id,
      version: orden.version + 1,
    });
    await this.registrarTransicion(orden, 'PAGADO', actorId, ip);
    return this.findOne(id);
  }

  private async registrarTransicion(orden: OrdenPago, nuevoEstado: EstadoOrdenPago, actorId: string, ip?: string, motivo?: string) {
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: `TRANSICION_${nuevoEstado}`,
      recurso: 'finanzas.ordenes_pago',
      recursoId: orden.id,
      datosAntes: { estado: orden.estado },
      datosDespues: { estado: nuevoEstado },
      metadata: motivo ? { motivo } : undefined,
      ip: ip ?? null,
    });
  }
}
