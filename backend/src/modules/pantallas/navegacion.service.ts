import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource, In } from 'typeorm';
import {
  FormularioHistorial,
  FormularioRespuesta,
  LogAuditoria,
  NavegacionEvento,
  Pantalla,
  Servicio,
  ServicioMensaje,
  SolicitudDespacho,
  SolicitudEvento,
  Usuario,
} from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { RegistrarNavegacionDto } from './dto/pantallas.dto';
import { CODIGO_PANTALLA, duracionVisita, MAX_EVENTOS_POR_ENVIO } from './pantallas.logica';

export interface ContextoNavegacion {
  usuarioId: string;
  username: string;
  ip?: string | null;
}

export interface EntradaLinea {
  hora: Date;
  /** NAVEGACION | AUDITORIA | SOLICITUD | CHAT | FORMULARIO */
  origen: string;
  titulo: string;
  detalle?: unknown;
  servicioId?: string | null;
  pantalla?: string;
  duracionSeg?: number | null;
}

/** Borde de un dia en hora local del servidor (el cuartel trabaja en una sola zona). */
/** Los ids de SQL Server llegan en mayusculas y los de la URL en minusculas: se comparan sin distinguir. */
const mismo = (a: string | null | undefined, b: string | null | undefined) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

export function limitesDelDia(fecha: string): [Date, Date] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new BadRequestException('La fecha debe ser AAAA-MM-DD.');
  const [a, m, d] = fecha.split('-').map(Number);
  const desde = new Date(a, m - 1, d, 0, 0, 0, 0);
  if (Number.isNaN(desde.getTime())) throw new BadRequestException('La fecha no es válida.');
  return [desde, new Date(a, m - 1, d + 1, 0, 0, 0, 0)];
}

@Injectable()
export class NavegacionService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  /**
   * Guarda visitas a pantallas. La app las junta (tambien sin conexion) y las manda por lotes;
   * la clave de cada visita hace que un reenvio no duplique.
   */
  async registrar(dto: RegistrarNavegacionDto, ctx: ContextoNavegacion, ahora = new Date()) {
    if (dto.eventos.length > MAX_EVENTOS_POR_ENVIO) throw new BadRequestException('Demasiados eventos en un solo envío.');
    const pantallas = new Set((await this.dataSource.getRepository(Pantalla).find({})).map((p) => p.codigo));
    const repo = this.dataSource.getRepository(NavegacionEvento);
    const existentes = new Set(
      (await repo.find({ where: { usuarioId: ctx.usuarioId } })).map((e) => e.claveIdempotencia).filter((c): c is string => !!c),
    );
    let guardados = 0;
    let duplicados = 0;
    const rechazados: string[] = [];
    for (const v of dto.eventos) {
      if (!CODIGO_PANTALLA.test(v.pantalla) || !pantallas.has(v.pantalla)) {
        rechazados.push(v.pantalla);
        continue;
      }
      if (v.clave && existentes.has(v.clave)) {
        duplicados++;
        continue;
      }
      const entrada = instanteDelHecho(v.entrada, ahora);
      const salidaBruta = v.salida ? instanteDelHecho(v.salida, ahora) : null;
      const salida = salidaBruta && salidaBruta.getTime() >= entrada.getTime() ? salidaBruta : null;
      await repo.save(
        repo.create({
          usuarioId: ctx.usuarioId,
          usuarioNombre: ctx.username,
          pantallaCodigo: v.pantalla,
          entrada,
          salida,
          duracionSeg: duracionVisita(entrada, salida),
          servicioId: v.servicioId ?? null,
          accion: v.accion ?? null,
          dispositivo: dto.dispositivo ?? null,
          conectado: v.conectado ?? true,
          ip: ctx.ip ?? null,
          registradoEn: ahora,
          claveIdempotencia: v.clave ?? null,
        }),
      );
      if (v.clave) existentes.add(v.clave);
      guardados++;
    }
    return { guardados, duplicados, rechazados };
  }

  /**
   * Linea de tiempo de una persona en un dia: por donde navego, y que hizo (auditoria, solicitudes,
   * chat, formularios). Se puede acotar a un servicio. Solo la ve quien tiene seguridad:ver_navegacion
   * y la propia consulta queda auditada.
   */
  async lineaDeUsuario(usuarioId: string, fecha: string, servicioId: string | undefined, quien: ContextoNavegacion) {
    const [desde, hasta] = limitesDelDia(fecha);
    const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { id: usuarioId } });
    const entradas: EntradaLinea[] = [];
    const nombresPantalla = new Map((await this.dataSource.getRepository(Pantalla).find({})).map((p) => [p.codigo, p.nombre]));

    const nav = await this.dataSource.getRepository(NavegacionEvento).find({ where: { usuarioId, entrada: Between(desde, hasta) }, order: { entrada: 'ASC' } });
    for (const n of nav) {
      if (servicioId && !mismo(n.servicioId, servicioId)) continue;
      entradas.push({
        hora: new Date(n.entrada),
        origen: 'NAVEGACION',
        titulo: `${n.pantallaCodigo} — ${nombresPantalla.get(n.pantallaCodigo) ?? 'Pantalla'}`,
        detalle: { accion: n.accion, salida: n.salida, dispositivo: n.dispositivo, conectado: n.conectado },
        servicioId: n.servicioId,
        pantalla: n.pantallaCodigo,
        duracionSeg: n.duracionSeg,
      });
    }

    if (!servicioId) {
      const logs = await this.dataSource.getRepository(LogAuditoria).find({ where: { usuarioId, fecha: Between(desde, hasta) }, order: { fecha: 'ASC' } });
      for (const l of logs) entradas.push({ hora: new Date(l.fecha), origen: 'AUDITORIA', titulo: `${l.accion} · ${l.recurso}`, detalle: { recursoId: l.recursoId, ip: l.ip } });
    }

    const eventos = await this.dataSource.getRepository(SolicitudEvento).find({ where: { ocurridoEn: Between(desde, hasta) }, order: { ocurridoEn: 'ASC' } });
    const delUsuario = eventos.filter((e) => mismo(e.actorId, usuarioId) || mismo(e.destinatarioId, usuarioId));
    const solicitudes = delUsuario.length ? await this.dataSource.getRepository(SolicitudDespacho).find({ where: { id: In([...new Set(delUsuario.map((e) => e.solicitudId))]) } }) : [];
    const servicioDe = new Map(solicitudes.map((x) => [x.id, x.servicioId]));
    for (const e of delUsuario) {
      const sv = servicioDe.get(e.solicitudId) ?? null;
      // al acotar a un servicio, solo cuentan las solicitudes vinculadas a ese servicio
      if (servicioId && !mismo(sv, servicioId)) continue;
      entradas.push({ hora: new Date(e.ocurridoEn), origen: 'SOLICITUD', titulo: `${e.tipo}${e.actorNombre ? ' · ' + e.actorNombre : ''}`, detalle: { solicitudId: e.solicitudId, detalle: e.detalle ? safeJson(e.detalle) : null }, servicioId: sv });
    }

    const mensajes = await this.dataSource.getRepository(ServicioMensaje).find({ where: { usuarioId, ocurridoEn: Between(desde, hasta) }, order: { ocurridoEn: 'ASC' } });
    for (const m of mensajes) {
      if (servicioId && !mismo(m.servicioId, servicioId)) continue;
      entradas.push({ hora: new Date(m.ocurridoEn), origen: 'CHAT', titulo: 'Mensaje en el servicio', detalle: { texto: m.texto }, servicioId: m.servicioId });
    }

    const hist = await this.dataSource.getRepository(FormularioHistorial).find({ where: { usuarioId, ocurridoEn: Between(desde, hasta) }, order: { ocurridoEn: 'ASC' } });
    if (hist.length) {
      const respuestas = await this.dataSource.getRepository(FormularioRespuesta).find({ where: { id: In([...new Set(hist.map((h) => h.respuestaId))]) } });
      for (const h of hist) {
        const r = respuestas.find((x) => x.id === h.respuestaId);
        if (servicioId && !mismo(r?.servicioId, servicioId)) continue;
        entradas.push({ hora: new Date(h.ocurridoEn), origen: 'FORMULARIO', titulo: `Formulario · ${h.accion}`, detalle: { respuestaId: h.respuestaId, estado: h.estadoDespues }, servicioId: r?.servicioId ?? null });
      }
    }

    entradas.sort((a, b) => a.hora.getTime() - b.hora.getTime());
    const serviciosIds = [...new Set(entradas.map((e) => e.servicioId).filter((s): s is string => !!s))];
    const servicios = serviciosIds.length ? await this.dataSource.getRepository(Servicio).find({ where: { id: In(serviciosIds) } }) : [];

    await this.auditoria.registrar({
      usuarioId: quien.usuarioId,
      accion: 'CONSULTAR_AUDITORIA_NAVEGACION',
      recurso: 'seguridad.navegacion_eventos',
      recursoId: usuarioId,
      datosDespues: { fecha, servicioId: servicioId ?? null, entradas: entradas.length },
      ip: quien.ip ?? null,
    });

    return {
      usuario: usuario ? { id: usuario.id, nombre: usuario.username } : { id: usuarioId, nombre: null },
      fecha,
      servicios: servicios.map((s) => ({ id: s.id, numero: s.numeroServicio, estado: s.estado })),
      totales: {
        entradas: entradas.length,
        pantallasVisitadas: nav.length,
        segundosEnPantallas: nav.reduce((n, e) => n + (e.duracionSeg ?? 0), 0),
      },
      linea: entradas,
    };
  }
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
