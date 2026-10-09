import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { EntityManager } from 'typeorm';
import { Bombero, IncidenteEvento, OrigenEvento, TipoEventoIncidente, Usuario } from '../../shared/entities';
import { nombreBombero } from './incidente.logica';
import type { CambioFase } from './motor-fases.service';
import { instanteDelHecho } from '../../shared/utils/instante';

export interface IdentidadAccion {
  servicioId: string;
  tipo: TipoEventoIncidente;
  usuarioId?: string | null;
  claveIdempotencia?: string | null;
  recurso: string;
  entrada: unknown;
}

/** JSON canónico: ordena objetos recursivamente; conserva orden de listas y fechas. */
function canonical(valor: unknown): string {
  if (valor instanceof Date) return JSON.stringify(valor.toISOString());
  if (valor === null || typeof valor === 'string' || typeof valor === 'boolean') return JSON.stringify(valor);
  if (typeof valor === 'number' && Number.isFinite(valor)) return JSON.stringify(valor);
  if (Array.isArray(valor)) return `[${valor.map((v) => v === undefined ? 'null' : canonical(v)).join(',')}]`;
  if (typeof valor === 'object' && valor) {
    const objeto = valor as Record<string, unknown>;
    return `{${Object.keys(objeto).filter((k) => objeto[k] !== undefined).sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(objeto[k])}`).join(',')}}`;
  }
  throw new BadRequestException('La entrada de idempotencia debe ser un valor JSON válido.');
}

function firma(accion: IdentidadAccion): string {
  return createHash('sha256').update(canonical({
    servicioId: accion.servicioId, tipo: accion.tipo, usuarioId: accion.usuarioId ?? null,
    recurso: accion.recurso, entrada: accion.entrada,
  })).digest('hex');
}

export interface Gps {
  latitud: number;
  longitud: number;
  precisionM?: number | null;
}

export interface NuevoEvento {
  servicioId: string;
  tipo: TipoEventoIncidente;
  titulo: string;
  ocurridoEn?: Date;
  usuarioId?: string | null;
  vehiculoId?: string | null;
  despachoId?: string | null;
  gps?: Gps | null;
  fase?: CambioFase | null;
  fuente?: string | null;
  fuenteId?: string | null;
  datos?: Record<string, unknown> | null;
  critico?: boolean;
  origen?: OrigenEvento;
  dispositivo?: string | null;
  claveIdempotencia?: string | null;
  /** El mismo recurso y DTO original que se verificaron ANTES de efectos; excluye valores derivados. */
  idempotencia?: { recurso: string; entrada: unknown };
}

/**
 * Bitacora unica del incidente. Se escribe SIEMPRE con el EntityManager de la transaccion de la
 * accion: si la accion se revierte, el evento tambien. La tabla rechaza UPDATE y DELETE.
 */
@Injectable()
export class CronologiaService {
  async registrar(m: EntityManager, e: NuevoEvento): Promise<IncidenteEvento> {
    const repo = m.getRepository(IncidenteEvento);
    const identidad: IdentidadAccion = {
      servicioId: e.servicioId, tipo: e.tipo, usuarioId: e.usuarioId, claveIdempotencia: e.claveIdempotencia,
      recurso: e.idempotencia?.recurso ?? canonical({ despachoId: e.despachoId ?? null, vehiculoId: e.vehiculoId ?? null, fuente: e.fuente ?? null, fuenteId: e.fuenteId ?? null }),
      entrada: e.idempotencia ? e.idempotencia.entrada : {
        titulo: e.titulo, ocurridoEn: e.ocurridoEn ?? null, gps: e.gps ?? null,
        fase: e.fase ?? null, datos: e.datos ?? null, critico: e.critico ?? false,
      },
    };
    if (e.claveIdempotencia) {
      const previo = await this.verificarIdempotencia(m, identidad);
      if (previo) return previo;
    }
    const ahora = new Date();
    return repo.save(
      repo.create({
        servicioId: e.servicioId,
        tipo: e.tipo,
        titulo: e.titulo.slice(0, 200),
        ocurridoEn: instanteDelHecho(e.ocurridoEn && Number.isFinite(e.ocurridoEn.getTime()) ? e.ocurridoEn.toISOString() : null, ahora),
        registradoEn: ahora,
        usuarioId: e.usuarioId ?? null,
        usuarioNombre: e.usuarioId ? await this.nombreDe(m, e.usuarioId) : null,
        vehiculoId: e.vehiculoId ?? null,
        despachoId: e.despachoId ?? null,
        latitud: e.gps?.latitud ?? null,
        longitud: e.gps?.longitud ?? null,
        precisionM: e.gps?.precisionM ?? null,
        faseAnterior: e.fase?.antes ?? null,
        faseNueva: e.fase?.despues ?? null,
        fuente: e.fuente ?? null,
        fuenteId: e.fuenteId ?? null,
        datos: e.claveIdempotencia
          ? JSON.stringify({ ...e.datos, __idempotencia: firma(identidad) })
          : e.datos ? JSON.stringify(e.datos) : null,
        critico: e.critico ?? false,
        origen: e.origen ?? 'WEB',
        dispositivo: e.dispositivo ? e.dispositivo.slice(0, 200) : null,
        claveIdempotencia: e.claveIdempotencia ?? null,
      }),
    );
  }

  /** Llamar bajo bloqueo del servicio, dentro de la transacción y ANTES de mutar recursos. */
  async verificarIdempotencia(m: EntityManager, accion: IdentidadAccion): Promise<IncidenteEvento | null> {
    if (!accion.claveIdempotencia) return null;
    const previo = await this.buscarPorClave(m, accion.servicioId, accion.claveIdempotencia);
    if (!previo) return null;
    let huella: unknown;
    try { huella = previo.datos ? JSON.parse(previo.datos).__idempotencia : null; } catch { huella = null; }
    if (previo.usuarioId !== (accion.usuarioId ?? null) || previo.tipo !== accion.tipo || huella !== firma(accion)) {
      throw new ConflictException('La clave de idempotencia ya fue utilizada para otra acción, recurso o entrada.');
    }
    return previo;
  }

  /** Reintentos: si la accion con esa clave ya quedo registrada, no se repite. */
  buscarPorClave(m: EntityManager, servicioId: string, clave: string): Promise<IncidenteEvento | null> {
    return m.getRepository(IncidenteEvento).findOne({ where: { servicioId, claveIdempotencia: clave } });
  }

  /** "Nombre Apellido (numero)" del bombero vinculado; si no hay, el nombre de usuario. */
  async nombreDe(m: EntityManager, usuarioId: string): Promise<string | null> {
    const u = await m.getRepository(Usuario).findOne({ where: { id: usuarioId } });
    if (!u) return null;
    if (u.bomberoId) {
      const b = await m.getRepository(Bombero).findOne({ where: { id: u.bomberoId } });
      if (b) return nombreBombero(b);
    }
    return u.username;
  }
}
