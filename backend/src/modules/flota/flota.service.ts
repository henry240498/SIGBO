import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import {
  Cuartel,
  Despacho,
  EstadoDespacho,
  EstadoOperativoMovil,
  HistorialServicio,
  MovilEstadoHistorial,
  PosicionMovil,
  Servicio,
  TipoEventoHistorialServicio,
  Vehiculo,
} from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CrearDespachoDto, ReportarPosicionDto } from './dto/flota.dto';
import { movilFueraDelCuartel } from './geocerca.util';

export interface ContextoFlota {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
}

type Paso = 'llegada' | 'fin' | 'regreso';

const ESTADOS_ACTIVOS: EstadoDespacho[] = ['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO'];

/** Transiciones permitidas de un despacho: avance lineal, sin saltos. */
const SIGUIENTE: Record<
  Paso,
  { desde: EstadoDespacho; hacia: EstadoDespacho; movil: EstadoOperativoMovil; evento: TipoEventoHistorialServicio }
> = {
  llegada: { desde: 'DESPACHADO', hacia: 'EN_SERVICIO', movil: 'EN_SERVICIO', evento: 'LLEGADA_SERVICIO' },
  fin: { desde: 'EN_SERVICIO', hacia: 'REGRESANDO', movil: 'REGRESANDO', evento: 'SALIDA_SERVICIO' },
  regreso: { desde: 'REGRESANDO', hacia: 'CERRADO', movil: 'EN_CUARTEL', evento: 'REGRESO_CUARTEL' },
};

@Injectable()
export class FlotaService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** Tablero: cada movil con su estado operativo y el despacho activo, si lo hay. */
  async tablero() {
    const moviles = await this.dataSource
      .getRepository(Vehiculo)
      .createQueryBuilder('v')
      .where('v.estado <> :baja', { baja: 'BAJA' })
      .orderBy('v.numeroInterno', 'ASC')
      .getMany();

    const activos = await this.dataSource
      .getRepository(Despacho)
      .createQueryBuilder('d')
      .leftJoin(Servicio, 's', 's.id = d.servicioId')
      .select([
        'd.id AS id',
        'd.vehiculoId AS vehiculoId',
        'd.servicioId AS servicioId',
        'd.estado AS estado',
        'd.horaSalida AS horaSalida',
        's.numeroServicio AS numeroServicio',
        's.direccion AS direccion',
      ])
      .where('d.estado IN (:...activos)', { activos: ESTADOS_ACTIVOS })
      .getRawMany();
    const porVehiculo = new Map(activos.map((a) => [a.vehiculoId as string, a]));
    const posiciones = new Map((await this.dataSource.getRepository(PosicionMovil).find({})).map((p) => [p.vehiculoId, p]));
    const cuartel = (await this.dataSource.getRepository(Cuartel).find({})).find((c) => c.latitud !== null && c.longitud !== null);

    return moviles.map((v) => {
      const g = movilFueraDelCuartel(v, posiciones.get(v.id), cuartel);
      return {
      id: v.id,
      numeroInterno: v.numeroInterno,
      alias: v.alias,
      tipo: v.tipo,
      estado: v.estado,
      estadoOperativo: v.estadoOperativo,
      estadoOperativoDesde: v.estadoOperativoDesde,
      despachoActivo: porVehiculo.get(v.id) ?? null,
      /** Aviso (no cambia ningun estado): figura en el cuartel pero el GPS lo ubica lejos. */
      alerta: g.fuera ? ('FUERA_DEL_CUARTEL_SIN_DESPACHO' as const) : null,
      distanciaCuartelM: g.distanciaM,
      };
    });
  }

  /** Registra la ultima posicion de un movil. Una lectura mas vieja que la
   * ya guardada se ignora (la app puede reenviar lecturas atrasadas). */
  async reportarPosicion(vehiculoId: string, dto: ReportarPosicionDto, usuarioId: string) {
    await this.obtenerVehiculo(this.dataSource.manager, vehiculoId);
    const repo = this.dataSource.getRepository(PosicionMovil);
    const ahora = new Date();
    const lectura = dto.registradoEn ? new Date(dto.registradoEn) : ahora;
    // Un reloj de dispositivo adelantado no debe "congelar" el mapa.
    const registradoEn = lectura.getTime() > ahora.getTime() ? ahora : lectura;
    const actual = await repo.findOne({ where: { vehiculoId } });
    if (actual && new Date(actual.registradoEn).getTime() >= registradoEn.getTime()) {
      return { guardada: false };
    }
    await repo.save(
      repo.create({
        vehiculoId,
        latitud: dto.latitud,
        longitud: dto.longitud,
        velocidadKmh: dto.velocidadKmh ?? null,
        precisionM: dto.precisionM ?? null,
        registradoEn,
        reportadoPor: usuarioId,
        actualizadoEn: ahora,
      }),
    );
    return { guardada: true };
  }

  /** Lista corta de moviles para que un celular elija en cual viaja. */
  async movilesParaReporte() {
    const moviles = await this.dataSource
      .getRepository(Vehiculo)
      .createQueryBuilder('v')
      .select(['v.id', 'v.numeroInterno', 'v.alias', 'v.tipo'])
      .where('v.estado <> :baja', { baja: 'BAJA' })
      .orderBy('v.numeroInterno', 'ASC')
      .getMany();
    return moviles.map((v) => ({ id: v.id, numeroInterno: v.numeroInterno, alias: v.alias, tipo: v.tipo }));
  }

  /** Moviles con su ultima posicion conocida y su estado operativo (para el mapa). */
  async posiciones() {
    const filas = await this.dataSource
      .getRepository(PosicionMovil)
      .createQueryBuilder('p')
      .innerJoin(Vehiculo, 'v', 'v.id = p.vehiculoId')
      .select([
        'p.vehiculoId AS id',
        'v.numeroInterno AS numeroInterno',
        'v.alias AS alias',
        'v.tipo AS tipo',
        'v.estadoOperativo AS estadoOperativo',
        'p.latitud AS latitud',
        'p.longitud AS longitud',
        'p.velocidadKmh AS velocidadKmh',
        'p.registradoEn AS registradoEn',
      ])
      .where('v.estado <> :baja', { baja: 'BAJA' })
      .getRawMany();
    return filas.map((f) => ({ ...f, latitud: Number(f.latitud), longitud: Number(f.longitud) }));
  }

  /** Documentos y mantenimientos que vencen dentro de `dias` (o ya vencidos). */
  async vencimientos(dias: number) {
    const limite = new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);
    const moviles = await this.dataSource
      .getRepository(Vehiculo)
      .createQueryBuilder('v')
      .where('v.estado <> :baja', { baja: 'BAJA' })
      .getMany();
    const tipos: Array<{ tipo: string; campo: 'itvVencimiento' | 'seguroVencimiento' | 'proximoMantenimiento' }> = [
      { tipo: 'ITV / VTV', campo: 'itvVencimiento' },
      { tipo: 'Seguro', campo: 'seguroVencimiento' },
      { tipo: 'Mantenimiento', campo: 'proximoMantenimiento' },
    ];
    const hoy = new Date().toISOString().slice(0, 10);
    const salida: Array<{ vehiculoId: string; numeroInterno: string; tipo: string; fecha: string; vencido: boolean }> = [];
    for (const v of moviles) {
      for (const { tipo, campo } of tipos) {
        const fecha = v[campo];
        if (fecha && String(fecha).slice(0, 10) <= limite) {
          salida.push({
            vehiculoId: v.id,
            numeroInterno: v.numeroInterno,
            tipo,
            fecha: String(fecha).slice(0, 10),
            vencido: String(fecha).slice(0, 10) < hoy,
          });
        }
      }
    }
    return salida.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  /** Datos de la ficha de cada movil que todavia no se cargaron. Se calcula siempre
   * sobre la ficha actual: al completar el dato, el pendiente desaparece solo. */
  async datosPendientes() {
    const moviles = (await this.dataSource.getRepository(Vehiculo).find({ order: { numeroInterno: 'ASC' } })).filter((v) => v.estado !== 'BAJA');
    const vacio = (x: unknown) => x === null || x === undefined || String(x).trim() === '';
    const salida: Array<{ vehiculoId: string; numeroInterno: string; faltantes: string[] }> = [];
    for (const v of moviles) {
      const f: string[] = [];
      if (vacio(v.patente)) f.push('Chapa');
      if (vacio(v.tipo) || v.tipo === 'Por definir') f.push('Tipo de vehículo');
      if (vacio(v.marca)) f.push('Marca');
      if (vacio(v.modelo)) f.push('Modelo');
      if (vacio(v.anio)) f.push('Año');
      if (vacio(v.numeroChasis)) f.push('Chasis');
      if (!v.kilometrajeActual) f.push('Kilometraje');
      if (vacio(v.itvVencimiento)) f.push('Vencimiento de ITV/VTV');
      if (vacio(v.seguroVencimiento)) f.push('Vencimiento del seguro');
      if (f.length) salida.push({ vehiculoId: v.id, numeroInterno: v.numeroInterno, faltantes: f });
    }
    return salida;
  }

  /** Servicios abiertos a los que todavia se pueden enviar moviles. */
  async serviciosAbiertos() {
    return this.dataSource
      .getRepository(Servicio)
      .createQueryBuilder('s')
      .select(['s.id', 's.numeroServicio', 's.direccion', 's.estado', 's.fechaHoraAviso'])
      .where('s.estado IN (:...estados)', { estados: ['REGISTRADO', 'DESPACHADO', 'EN_CURSO'] })
      .orderBy('s.fechaHoraAviso', 'DESC')
      .take(100)
      .getMany();
  }

  async historialMovil(vehiculoId: string, limite = 100) {
    await this.obtenerVehiculo(this.dataSource.manager, vehiculoId);
    return this.dataSource.getRepository(MovilEstadoHistorial).find({
      where: { vehiculoId },
      order: { creadoEn: 'DESC' },
      take: Math.min(Math.max(limite || 100, 1), 500),
    });
  }

  async listarDespachos(filtros: { servicioId?: string; activos?: boolean; limite?: number }) {
    const qb = this.dataSource
      .getRepository(Despacho)
      .createQueryBuilder('d')
      .orderBy('d.horaSalida', 'DESC')
      .take(Math.min(Math.max(filtros.limite || 100, 1), 500));
    if (filtros.servicioId) qb.andWhere('d.servicioId = :s', { s: filtros.servicioId });
    if (filtros.activos) qb.andWhere('d.estado IN (:...activos)', { activos: ESTADOS_ACTIVOS });
    const despachos = await qb.getMany();
    return despachos.map((d) => this.conTiempos(d));
  }

  async despachar(dto: CrearDespachoDto, ctx: ContextoFlota) {
    if (dto.id) {
      const previo = await this.dataSource.getRepository(Despacho).findOne({ where: { id: dto.id } });
      if (previo) {
        // Reintento del mismo envio: se devuelve lo ya hecho, sin repetir efectos. Solo si es el mismo movil y servicio.
        if (previo.vehiculoId !== dto.vehiculoId || previo.servicioId !== dto.servicioId) {
          throw new ConflictException('Ese identificador de despacho ya se uso para otro movil o servicio.');
        }
        return this.conTiempos(previo);
      }
    }
    let despacho: Despacho;
    try {
      despacho = await this.dataSource.transaction(async (m) => {
        const servicio = await m.findOne(Servicio, { where: { id: dto.servicioId } });
        if (!servicio) throw new NotFoundException('Servicio no encontrado');
        if (servicio.estado === 'FINALIZADO' || servicio.estado === 'CANCELADO') {
          throw new ConflictException(`El servicio ya esta ${servicio.estado}; no admite despachos.`);
        }
        const vehiculo = await this.obtenerVehiculo(m, dto.vehiculoId, true);
        if (vehiculo.estado !== 'OPERATIVO') {
          throw new ConflictException(`El movil esta ${vehiculo.estado}; solo un movil OPERATIVO puede despacharse.`);
        }
        if (vehiculo.estadoOperativo !== 'EN_CUARTEL') {
          throw new ConflictException(`El movil ya esta ${vehiculo.estadoOperativo}; debe estar EN_CUARTEL para despacharse.`);
        }

        const ahora = instanteDelHecho(dto.ocurridoEn);
        const creado = await m.save(
          m.create(Despacho, {
            ...(dto.id ? { id: dto.id } : {}),
            servicioId: servicio.id,
            vehiculoId: vehiculo.id,
            conductorId: dto.conductorId ?? null,
            estado: 'DESPACHADO',
            horaSalida: ahora,
            kmSalida: dto.kmSalida ?? vehiculo.kilometrajeActual ?? null,
            observaciones: dto.observaciones?.trim() || null,
            creadoPor: ctx.usuarioId,
          }),
        );

        // Primer movil en salir: el servicio pasa a DESPACHADO y toma la hora de salida.
        if (servicio.estado === 'REGISTRADO') servicio.estado = 'DESPACHADO';
        if (!servicio.fechaHoraSalida) servicio.fechaHoraSalida = ahora;
        await m.save(servicio);

        await this.cambiarEstadoMovil(m, vehiculo, 'DESPACHADO', {
          servicioId: servicio.id,
          despachoId: creado.id,
          usuarioId: ctx.usuarioId,
          ahora,
        });
        await this.registrarEvento(m, servicio.id, vehiculo.id, 'SALIDA_CUARTEL', ahora, ctx.usuarioId);
        return creado;
      });
    } catch (error) {
      // El indice unico filtrado gana la carrera entre dos operadores.
      const numero = (error as { number?: number; driverError?: { number?: number } })?.number
        ?? (error as { driverError?: { number?: number } })?.driverError?.number;
      if (numero === 2601 || numero === 2627) {
        throw new ConflictException('El movil ya tiene un despacho activo.');
      }
      throw error;
    }

    await this.auditar('DESPACHAR', despacho, null, ctx);
    return this.conTiempos(despacho);
  }

  async avanzar(id: string, paso: Paso, ctx: ContextoFlota, extra: { kmRegreso?: number; ocurridoEn?: string } = {}) {
    const { despacho, antes } = await this.dataSource.transaction(async (m) => {
      const d = await this.obtenerDespacho(m, id, true);
      const regla = SIGUIENTE[paso];
      if (d.estado !== regla.desde) {
        throw new ConflictException(`El despacho esta ${d.estado}; ${paso} solo aplica desde ${regla.desde}.`);
      }
      // El hito no puede quedar antes del anterior aunque el celular tenga el reloj atrasado.
      const previo = paso === 'llegada' ? d.horaSalida : paso === 'fin' ? d.horaLlegada : d.horaFin;
      const ahora = instanteDelHecho(extra.ocurridoEn, new Date(), previo);
      const estadoAntes = d.estado;
      d.estado = regla.hacia;
      if (paso === 'llegada') d.horaLlegada = ahora;
      if (paso === 'fin') d.horaFin = ahora;
      if (paso === 'regreso') d.horaRegreso = ahora;
      if (paso === 'regreso' && extra.kmRegreso !== undefined) {
        if (d.kmSalida !== null && extra.kmRegreso < d.kmSalida) {
          throw new BadRequestException(`El kilometraje de regreso (${extra.kmRegreso}) no puede ser menor que el de salida (${d.kmSalida}).`);
        }
        d.kmRegreso = extra.kmRegreso;
      }
      await m.save(d);

      const vehiculo = await this.obtenerVehiculo(m, d.vehiculoId, true);
      if (paso === 'regreso' && d.kmRegreso !== null && d.kmRegreso > (vehiculo.kilometrajeActual ?? 0)) {
        vehiculo.kilometrajeActual = d.kmRegreso;
      }
      await this.cambiarEstadoMovil(m, vehiculo, regla.movil, {
        servicioId: d.servicioId,
        despachoId: d.id,
        usuarioId: ctx.usuarioId,
        ahora,
      });
      await this.registrarEvento(m, d.servicioId, vehiculo.id, regla.evento, ahora, ctx.usuarioId);

      // Primera llegada al lugar: el servicio pasa a EN_CURSO. Finalizarlo
      // sigue siendo una decision del mando (servicios:finalizar).
      if (paso === 'llegada') {
        const servicio = await m.findOne(Servicio, { where: { id: d.servicioId } });
        if (servicio) {
          if (!servicio.fechaHoraLlegada) servicio.fechaHoraLlegada = ahora;
          if (servicio.estado === 'DESPACHADO') servicio.estado = 'EN_CURSO';
          await m.save(servicio);
        }
      }
      return { despacho: d, antes: estadoAntes };
    });
    await this.auditar(paso.toUpperCase(), despacho, antes, ctx);
    return this.conTiempos(despacho);
  }

  async cancelar(id: string, motivo: string, ctx: ContextoFlota) {
    const motivoLimpio = motivo.trim();
    if (!motivoLimpio) throw new BadRequestException('El motivo es obligatorio.');
    const { despacho, antes } = await this.dataSource.transaction(async (m) => {
      const d = await this.obtenerDespacho(m, id, true);
      if (!ESTADOS_ACTIVOS.includes(d.estado)) {
        throw new ConflictException(`El despacho ya esta ${d.estado}.`);
      }
      const estadoAntes = d.estado;
      d.estado = 'CANCELADO';
      d.motivoCancelacion = motivoLimpio;
      await m.save(d);
      const vehiculo = await this.obtenerVehiculo(m, d.vehiculoId, true);
      await this.cambiarEstadoMovil(m, vehiculo, 'EN_CUARTEL', {
        servicioId: d.servicioId,
        despachoId: d.id,
        usuarioId: ctx.usuarioId,
        ahora: new Date(),
        motivo: `Despacho cancelado: ${motivoLimpio}`,
      });
      return { despacho: d, antes: estadoAntes };
    });
    await this.auditar('CANCELAR', despacho, antes, ctx);
    return this.conTiempos(despacho);
  }

  /** Correccion manual: el movil figura fuera del cuartel pero ya esta en el. */
  async reponerEnCuartel(vehiculoId: string, motivo: string, ctx: ContextoFlota) {
    const motivoLimpio = motivo.trim();
    if (!motivoLimpio) throw new BadRequestException('El motivo es obligatorio.');
    const antes = await this.dataSource.transaction(async (m) => {
      const vehiculo = await this.obtenerVehiculo(m, vehiculoId, true);
      const activo = await m.findOne(Despacho, {
        where: ESTADOS_ACTIVOS.map((estado) => ({ vehiculoId, estado })),
      });
      const estadoAntes = vehiculo.estadoOperativo;
      if (activo) {
        activo.estado = 'CANCELADO';
        activo.motivoCancelacion = `Corregido manualmente: ${motivoLimpio}`;
        await m.save(activo);
      }
      await this.cambiarEstadoMovil(m, vehiculo, 'EN_CUARTEL', {
        servicioId: activo?.servicioId ?? null,
        despachoId: activo?.id ?? null,
        usuarioId: ctx.usuarioId,
        ahora: new Date(),
        motivo: motivoLimpio,
      });
      return estadoAntes;
    });
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'REPONER_EN_CUARTEL',
      recurso: 'vehiculos.movil_estado',
      recursoId: vehiculoId,
      datosAntes: { estadoOperativo: antes },
      datosDespues: { estadoOperativo: 'EN_CUARTEL', motivo: motivoLimpio },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return { id: vehiculoId, estadoOperativo: 'EN_CUARTEL' as const };
  }

  // --- internos ---

  /** `bloquear` toma un bloqueo de escritura (solo valido dentro de una transaccion):
   * dos operadores sobre el mismo movil o despacho se atienden uno tras otro. */
  private async obtenerVehiculo(m: EntityManager, id: string, bloquear = false): Promise<Vehiculo> {
    const v = await m.findOne(Vehiculo, { where: { id }, ...(bloquear ? { lock: { mode: 'pessimistic_write' as const } } : {}) });
    if (!v) throw new NotFoundException('Movil no encontrado');
    return v;
  }

  private async obtenerDespacho(m: EntityManager, id: string, bloquear = false): Promise<Despacho> {
    const d = await m.findOne(Despacho, { where: { id }, ...(bloquear ? { lock: { mode: 'pessimistic_write' as const } } : {}) });
    if (!d) throw new NotFoundException('Despacho no encontrado');
    return d;
  }

  private async cambiarEstadoMovil(
    m: EntityManager,
    vehiculo: Vehiculo,
    nuevo: EstadoOperativoMovil,
    datos: { servicioId: string | null; despachoId: string | null; usuarioId: string; ahora: Date; motivo?: string },
  ) {
    const anterior = vehiculo.estadoOperativo;
    vehiculo.estadoOperativo = nuevo;
    vehiculo.estadoOperativoDesde = datos.ahora;
    await m.save(vehiculo);
    await m.save(
      m.create(MovilEstadoHistorial, {
        vehiculoId: vehiculo.id,
        estadoAnterior: anterior,
        estadoNuevo: nuevo,
        servicioId: datos.servicioId,
        despachoId: datos.despachoId,
        motivo: datos.motivo ?? null,
        usuarioId: datos.usuarioId,
      }),
    );
  }

  private registrarEvento(
    m: EntityManager,
    servicioId: string,
    movilId: string,
    tipoEvento: TipoEventoHistorialServicio,
    cuando: Date,
    usuarioId: string,
  ) {
    return m.save(
      m.create(HistorialServicio, {
        servicioId,
        movilId,
        tipoEvento,
        timestampEvento: cuando,
        creadoPor: usuarioId,
      }),
    );
  }

  private auditar(accion: string, d: Despacho, antes: EstadoDespacho | null, ctx: ContextoFlota) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso: 'servicios.despacho',
      recursoId: d.id,
      datosAntes: antes ? { estado: antes } : undefined,
      datosDespues: { estado: d.estado, servicioId: d.servicioId, vehiculoId: d.vehiculoId },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
  }

  /** Tiempos de respuesta derivados, en segundos (null si el hito no ocurrio). */
  private conTiempos(d: Despacho) {
    const seg = (a: Date | null, b: Date | null) =>
      a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 1000) : null;
    return {
      ...d,
      tiempoRespuestaSegundos: seg(d.horaSalida, d.horaLlegada),
      tiempoEnLugarSegundos: seg(d.horaLlegada, d.horaFin),
      tiempoRegresoSegundos: seg(d.horaFin, d.horaRegreso),
    };
  }
}
