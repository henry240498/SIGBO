import { BadRequestException } from '@nestjs/common';
import type { EstadoServicio } from '../../shared/entities/servicio.entity';

/** Un servicio esta "activo" mientras se atiende: aviso recibido, despachado o en curso. */
export const ESTADOS_ACTIVOS: EstadoServicio[] = ['REGISTRADO', 'DESPACHADO', 'EN_CURSO'];
export const esActivo = (estado: EstadoServicio) => ESTADOS_ACTIVOS.includes(estado);

// ---------------------------------------------------------------- formularios

export type TipoCampo = 'texto' | 'texto_largo' | 'numero' | 'si_no' | 'opcion' | 'fecha_hora';
const TIPOS_CAMPO: TipoCampo[] = ['texto', 'texto_largo', 'numero', 'si_no', 'opcion', 'fecha_hora'];

export interface CampoFormulario {
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  requerido?: boolean;
  opciones?: string[];
  /** Solo lo ve quien puede ver informacion confidencial. */
  confidencial?: boolean;
}

export const MAX_CAMPOS = 60;
export const MAX_TEXTO = 2000;

export function parsearCampos(json: string): CampoFormulario[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? (v as CampoFormulario[]) : [];
  } catch {
    return [];
  }
}

/** Valida la definicion de un formulario antes de guardarla. */
export function validarCampos(campos: unknown): CampoFormulario[] {
  if (!Array.isArray(campos) || campos.length === 0) throw new BadRequestException('El formulario necesita al menos un campo.');
  if (campos.length > MAX_CAMPOS) throw new BadRequestException(`Un formulario admite hasta ${MAX_CAMPOS} campos.`);
  const claves = new Set<string>();
  const salida: CampoFormulario[] = [];
  for (const c of campos as Partial<CampoFormulario>[]) {
    if (!c || typeof c.clave !== 'string' || !/^[a-z][a-z0-9_]{0,39}$/.test(c.clave)) throw new BadRequestException(`Clave de campo inválida: «${String(c?.clave)}» (minúsculas, números y guion bajo).`);
    if (claves.has(c.clave)) throw new BadRequestException(`La clave «${c.clave}» está repetida.`);
    claves.add(c.clave);
    if (typeof c.etiqueta !== 'string' || !c.etiqueta.trim() || c.etiqueta.length > 120) throw new BadRequestException(`El campo «${c.clave}» necesita una etiqueta (hasta 120 caracteres).`);
    if (!c.tipo || !TIPOS_CAMPO.includes(c.tipo)) throw new BadRequestException(`El tipo del campo «${c.clave}» no es válido.`);
    if (c.tipo === 'opcion' && (!Array.isArray(c.opciones) || c.opciones.length < 2 || c.opciones.some((o) => typeof o !== 'string' || !o.trim()))) {
      throw new BadRequestException(`El campo «${c.clave}» necesita al menos dos opciones.`);
    }
    salida.push({ clave: c.clave, etiqueta: c.etiqueta.trim(), tipo: c.tipo, requerido: !!c.requerido, opciones: c.tipo === 'opcion' ? c.opciones!.map((o) => o.trim()) : undefined, confidencial: !!c.confidencial });
  }
  return salida;
}

/**
 * Valida lo que se cargo contra la definicion. Un borrador puede estar incompleto; al completar
 * se exigen los campos requeridos. Las claves que la definicion no conoce se rechazan: nadie
 * agrega datos por fuera del formulario.
 */
export function validarDatos(campos: CampoFormulario[], datos: Record<string, unknown>, completar: boolean): Record<string, unknown> {
  const limpio: Record<string, unknown> = {};
  const porClave = new Map(campos.map((c) => [c.clave, c]));
  for (const k of Object.keys(datos)) {
    if (!porClave.has(k)) throw new BadRequestException(`El campo «${k}» no existe en este formulario.`);
  }
  for (const c of campos) {
    const v = datos[c.clave];
    const vacio = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    if (vacio) {
      if (completar && c.requerido) throw new BadRequestException(`Falta completar «${c.etiqueta}».`);
      continue;
    }
    switch (c.tipo) {
      case 'texto':
      case 'texto_largo': {
        if (typeof v !== 'string') throw new BadRequestException(`«${c.etiqueta}» debe ser texto.`);
        limpio[c.clave] = v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, c.tipo === 'texto' ? 300 : MAX_TEXTO);
        break;
      }
      case 'numero': {
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n)) throw new BadRequestException(`«${c.etiqueta}» debe ser un número.`);
        limpio[c.clave] = n;
        break;
      }
      case 'si_no': {
        if (typeof v !== 'boolean') throw new BadRequestException(`«${c.etiqueta}» debe ser Sí o No.`);
        limpio[c.clave] = v;
        break;
      }
      case 'opcion': {
        if (typeof v !== 'string' || !c.opciones?.includes(v)) throw new BadRequestException(`«${c.etiqueta}»: elija una de las opciones.`);
        limpio[c.clave] = v;
        break;
      }
      case 'fecha_hora': {
        const f = new Date(String(v));
        if (Number.isNaN(f.getTime())) throw new BadRequestException(`«${c.etiqueta}» debe ser una fecha y hora válidas.`);
        limpio[c.clave] = f.toISOString();
        break;
      }
    }
  }
  return limpio;
}

/** Quita los campos confidenciales cuando la persona no puede verlos. La marca avisa que existen. */
export function redactarDatos(campos: CampoFormulario[], datos: Record<string, unknown>, puedeVerConfidencial: boolean) {
  if (puedeVerConfidencial) return { datos, ocultos: [] as string[] };
  const ocultos = campos.filter((c) => c.confidencial && datos[c.clave] !== undefined).map((c) => c.clave);
  const visibles = Object.fromEntries(Object.entries(datos).filter(([k]) => !ocultos.includes(k)));
  return { datos: visibles, ocultos };
}

/** Claves cuyo valor cambio entre dos versiones: lo que el historial deja a la vista. */
export function clavesCambiadas(antes: Record<string, unknown>, despues: Record<string, unknown>): string[] {
  const todas = new Set([...Object.keys(antes), ...Object.keys(despues)]);
  return [...todas].filter((k) => JSON.stringify(antes[k]) !== JSON.stringify(despues[k]));
}

export interface ContextoFormulario {
  tipoServicioId: string;
  estadoServicio: EstadoServicio;
  roles: string[];
  permisos: string[];
}

export interface DefinicionDisponible {
  tiposServicio: string | null;
  roles: string | null;
  permisoRequerido: string | null;
  etapa: 'EN_CURSO' | 'CIERRE' | null;
  activo: boolean;
}

const lista = (json: string | null): string[] | null => {
  if (!json) return null;
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : null;
  } catch {
    return null;
  }
};

/** ¿Se le ofrece este formulario a esta persona en este servicio? Segun tipo de servicio, rol, permiso y etapa. */
export function formularioDisponible(def: DefinicionDisponible, ctx: ContextoFormulario): boolean {
  if (!def.activo) return false;
  const tipos = lista(def.tiposServicio);
  if (tipos && tipos.length && !tipos.includes(ctx.tipoServicioId)) return false;
  const roles = lista(def.roles);
  if (roles && roles.length && !roles.some((r) => ctx.roles.map((x) => x.toLowerCase()).includes(r.toLowerCase()))) return false;
  if (def.permisoRequerido && !ctx.permisos.includes(def.permisoRequerido)) return false;
  if (def.etapa === 'EN_CURSO' && !esActivo(ctx.estadoServicio)) return false;
  if (def.etapa === 'CIERRE' && ctx.estadoServicio !== 'EN_CURSO' && ctx.estadoServicio !== 'FINALIZADO') return false;
  return true;
}

// ---------------------------------------------------------------- chat

export const MAX_MENSAJE = 500;

export function limpiarMensaje(texto: unknown): string {
  const t = String(texto ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim();
  if (!t) throw new BadRequestException('El mensaje está vacío.');
  return t.slice(0, MAX_MENSAJE);
}
