import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Despacho, DotacionMovil, Servicio, Vehiculo } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ActualizarDotacionDto, ControlDotacionDto, CrearDotacionDto } from './dto/dotacion.dto';
import { ContextoFlota } from './flota.service';

/** Faltante de un item: null si nunca se controlo; 0 si esta completo. */
export function faltante(item: Pick<DotacionMovil, 'cantidadObjetivo' | 'cantidadActual'>): number | null {
  if (item.cantidadActual === null || item.cantidadActual === undefined) return null;
  return Math.max(0, item.cantidadObjetivo - item.cantidadActual);
}

@Injectable()
export class DotacionService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async listar(vehiculoId: string, incluirInactivos = false) {
    await this.obtenerVehiculo(vehiculoId);
    const items = await this.dataSource.getRepository(DotacionMovil).find({
      where: incluirInactivos ? { vehiculoId } : { vehiculoId, activo: true },
      order: { descripcion: 'ASC' },
    });
    return items.map((i) => ({ ...i, faltante: faltante(i) }));
  }

  async crear(vehiculoId: string, dto: CrearDotacionDto, ctx: ContextoFlota) {
    await this.obtenerVehiculo(vehiculoId);
    const repo = this.dataSource.getRepository(DotacionMovil);
    const existentes = await repo.find({ where: { vehiculoId, activo: true } });
    if (existentes.some((e) => e.descripcion.toLowerCase() === dto.descripcion.toLowerCase())) {
      throw new BadRequestException(`El movil ya tiene "${dto.descripcion}" en su dotacion.`);
    }
    const item = await repo.save(
      repo.create({
        vehiculoId,
        descripcion: dto.descripcion,
        articuloId: dto.articuloId ?? null,
        cantidadObjetivo: dto.cantidadObjetivo,
        cantidadActual: null,
        controladoEn: null,
        controladoPor: null,
        activo: true,
      }),
    );
    await this.auditar('CREAR', item.id, null, { vehiculoId, descripcion: item.descripcion, objetivo: item.cantidadObjetivo }, ctx);
    return { ...item, faltante: faltante(item) };
  }

  async actualizar(itemId: string, dto: ActualizarDotacionDto, ctx: ContextoFlota) {
    const repo = this.dataSource.getRepository(DotacionMovil);
    const item = await repo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item de dotacion no encontrado');
    const antes = { descripcion: item.descripcion, objetivo: item.cantidadObjetivo, activo: item.activo };
    if (dto.descripcion !== undefined) item.descripcion = dto.descripcion;
    if (dto.cantidadObjetivo !== undefined) item.cantidadObjetivo = dto.cantidadObjetivo;
    if (dto.activo !== undefined) item.activo = dto.activo;
    const guardado = await repo.save(item);
    await this.auditar(
      dto.activo === false ? 'BAJA' : 'ACTUALIZAR',
      itemId,
      antes,
      { descripcion: guardado.descripcion, objetivo: guardado.cantidadObjetivo, activo: guardado.activo },
      ctx,
    );
    return { ...guardado, faltante: faltante(guardado) };
  }

  /** Registra lo hallado en el control: una sola operacion para todos los items. */
  async registrarControl(vehiculoId: string, dto: ControlDotacionDto, ctx: ContextoFlota) {
    await this.obtenerVehiculo(vehiculoId);
    const repo = this.dataSource.getRepository(DotacionMovil);
    const items = await repo.find({ where: { vehiculoId, activo: true } });
    const porId = new Map(items.map((i) => [i.id, i]));
    // Validar todo antes de guardar nada: o se registra el control completo o no se registra.
    for (const l of dto.lecturas) {
      if (!porId.has(l.itemId)) throw new BadRequestException(`El item ${l.itemId} no pertenece a la dotacion activa de este movil.`);
    }
    if (new Set(dto.lecturas.map((l) => l.itemId)).size !== dto.lecturas.length) {
      throw new BadRequestException('Hay items repetidos en el control.');
    }
    const ahora = new Date();
    for (const l of dto.lecturas) {
      const item = porId.get(l.itemId)!;
      item.cantidadActual = l.cantidadActual;
      item.controladoEn = ahora;
      item.controladoPor = ctx.usuarioId;
      await repo.save(item);
    }
    const resultado = dto.lecturas.map((l) => {
      const i = porId.get(l.itemId)!;
      return { itemId: i.id, descripcion: i.descripcion, objetivo: i.cantidadObjetivo, actual: i.cantidadActual, faltante: faltante(i) };
    });
    await this.auditar('CONTROL', vehiculoId, null, { items: resultado.length, conFaltante: resultado.filter((r) => (r.faltante ?? 0) > 0).length }, ctx);
    return resultado;
  }

  /** Reposicion pendiente: todo lo que, en el ultimo control, estaba por debajo del objetivo. */
  async faltantes() {
    const items = await this.dataSource.getRepository(DotacionMovil).find({ where: { activo: true } });
    const conFaltante = items.filter((i) => (faltante(i) ?? 0) > 0);
    if (conFaltante.length === 0) return [];
    const vehiculos = await this.dataSource.getRepository(Vehiculo).find({});
    const porVehiculo = new Map(vehiculos.map((v) => [v.id, v]));
    return conFaltante
      .map((i) => ({
        itemId: i.id,
        vehiculoId: i.vehiculoId,
        numeroInterno: porVehiculo.get(i.vehiculoId)?.numeroInterno ?? '?',
        descripcion: i.descripcion,
        objetivo: i.cantidadObjetivo,
        actual: i.cantidadActual,
        faltante: faltante(i),
        controladoEn: i.controladoEn,
      }))
      .sort((a, b) => a.numeroInterno.localeCompare(b.numeroInterno) || a.descripcion.localeCompare(b.descripcion));
  }

  /** Bitacora de uso: cada salida del movil, a que servicio, con tiempos y kilometros. */
  async bitacora(vehiculoId: string, limite = 100) {
    await this.obtenerVehiculo(vehiculoId);
    const despachos = await this.dataSource.getRepository(Despacho).find({
      where: { vehiculoId },
      order: { horaSalida: 'DESC' },
      take: Math.min(Math.max(limite || 100, 1), 500),
    });
    const servicios = await this.dataSource.getRepository(Servicio).find({});
    const porServicio = new Map(servicios.map((s) => [s.id, s]));
    return despachos.map((d) => ({
      despachoId: d.id,
      servicioId: d.servicioId,
      numeroServicio: porServicio.get(d.servicioId)?.numeroServicio ?? null,
      direccion: porServicio.get(d.servicioId)?.direccion ?? null,
      conductorId: d.conductorId,
      estado: d.estado,
      horaSalida: d.horaSalida,
      horaRegreso: d.horaRegreso,
      kmSalida: d.kmSalida,
      kmRegreso: d.kmRegreso,
      kmRecorridos: d.kmSalida !== null && d.kmRegreso !== null && d.kmSalida !== undefined && d.kmRegreso !== undefined ? d.kmRegreso - d.kmSalida : null,
    }));
  }

  private async obtenerVehiculo(id: string) {
    const v = await this.dataSource.getRepository(Vehiculo).findOne({ where: { id } });
    if (!v) throw new NotFoundException('Movil no encontrado');
    return v;
  }

  private auditar(accion: string, recursoId: string, antes: unknown, despues: unknown, ctx: ContextoFlota) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso: 'vehiculos.dotacion',
      recursoId,
      datosAntes: antes ?? undefined,
      datosDespues: despues,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
  }
}
