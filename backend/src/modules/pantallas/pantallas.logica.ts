import type { PantallaPermiso } from '../../shared/entities/despacho-servicio.entity';

export type AccionPantalla = 'ver' | 'crear' | 'editar' | 'eliminar' | 'confidencial';
export const ACCIONES_PANTALLA: AccionPantalla[] = ['ver', 'crear', 'editar', 'eliminar', 'confidencial'];

/**
 * Permiso base (RBAC) que habilita cada accion de cada pantalla. Es lo que rige cuando el
 * administrador no configuro nada para esa pantalla y esa persona, de modo que activar la
 * matriz no rompe lo que ya funciona. Los codigos son los de seguridad.pantallas (mig. 090).
 */
export const BASE_RBAC: Record<string, Partial<Record<AccionPantalla, string>>> = {
  '0xA001': { ver: 'despacho:responder' },
  '0xA002': { ver: 'servicios:ver' },
  '0xA003': { ver: 'despacho:responder', crear: 'despacho:solicitar' },
  '0xA004': { ver: 'despacho:solicitar', crear: 'despacho:solicitar' },
  '0xA005': { ver: 'despacho:solicitar', crear: 'despacho:solicitar' },
  '0xA006': { ver: 'despacho:servicio', crear: 'despacho:servicio', editar: 'despacho:servicio', confidencial: 'despacho:confidencial' },
  '0xA007': { ver: 'despacho:servicio', crear: 'despacho:servicio' },
  '0xA008': { ver: 'despacho:servicio', crear: 'despacho:servicio', editar: 'despacho:servicio', eliminar: 'despacho:formularios_admin', confidencial: 'despacho:confidencial' },
  '0xA009': { ver: 'seguridad:gestionar_pantallas', crear: 'seguridad:gestionar_pantallas', editar: 'seguridad:gestionar_pantallas', eliminar: 'seguridad:gestionar_pantallas' },
  '0xA00A': { ver: 'seguridad:ver_navegacion', confidencial: 'seguridad:ver_navegacion' },
  '0xA00B': { ver: 'despacho:solicitar', crear: 'despacho:solicitar' },
  '0xA00C': { ver: 'despacho:responder', crear: 'despacho:responder', editar: 'despacho:responder' },
  '0xA00D': { ver: 'despacho:seguimiento' },
  '0xA00E': { ver: 'despacho:servicio', confidencial: 'despacho:confidencial' },
  '0xA00F': { ver: 'despacho:confidencial', confidencial: 'despacho:confidencial' },
  '0xA010': { ver: 'navegacion:registrar' },
  '0xA011': { ver: 'reportes:enviar', crear: 'reportes:enviar' },
  '0xA012': { ver: 'despacho:responder' },
};

export interface SujetoUsuario {
  usuarioId: string;
  rolIds: string[];
  rangoId: string | null;
  cargo: string | null;
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

/** ¿Esta regla le corresponde a esta persona? Por su usuario, alguno de sus roles vigentes, su rango o su cargo. */
export function reglaAplica(r: Pick<PantallaPermiso, 'sujetoTipo' | 'sujetoId'>, s: SujetoUsuario): boolean {
  switch (r.sujetoTipo) {
    case 'USUARIO': return norm(r.sujetoId) === norm(s.usuarioId);
    case 'ROL': return s.rolIds.some((id) => norm(id) === norm(r.sujetoId));
    case 'RANGO': return !!s.rangoId && norm(s.rangoId) === norm(r.sujetoId);
    case 'CARGO': return !!s.cargo && norm(s.cargo) === norm(r.sujetoId);
    default: return false;
  }
}

export interface Decision {
  permitido: boolean;
  /** MATRIZ: decidio una regla configurada; BASE: rige el permiso por rol. */
  origen: 'MATRIZ' | 'BASE';
}

/**
 * Decide una accion sobre una pantalla.
 *  - La denegacion de cualquier regla aplicable gana siempre.
 *  - "ver", "crear", "editar" y "eliminar": la matriz solo RESTRINGE. Hace falta el permiso base
 *    Y, si hay reglas aplicables, que alguna conceda la accion. (El endpoint ademas exige su
 *    permiso por rol, asi que una concesion de la matriz no puede dar mas que eso.)
 *  - "confidencial": si hay reglas aplicables, deciden ellas (pueden conceder o quitar);
 *    si no, rige el permiso base.
 */
export function decidir(
  codigo: string,
  accion: AccionPantalla,
  permisosDelUsuario: string[],
  reglas: PantallaPermiso[],
  sujeto: SujetoUsuario,
): Decision {
  const permisoBase = BASE_RBAC[codigo]?.[accion];
  const base = !!permisoBase && permisosDelUsuario.includes(permisoBase);
  const aplicables = reglas.filter((r) => r.pantallaCodigo === codigo && reglaAplica(r, sujeto));
  if (!aplicables.length) return { permitido: base, origen: 'BASE' };
  if (aplicables.some((r) => r.denegar)) return { permitido: false, origen: 'MATRIZ' };
  const concede = aplicables.some((r) => !!r[accion]);
  if (accion === 'confidencial') return { permitido: concede, origen: 'MATRIZ' };
  return { permitido: base && concede, origen: 'MATRIZ' };
}

// ---------------------------------------------------------------- navegacion

export const MAX_DURACION_VISITA_SEG = 24 * 3600;
export const MAX_EVENTOS_POR_ENVIO = 200;

/** Duracion de una visita, acotada: una salida anterior a la entrada o un dia entero no son creibles. */
export function duracionVisita(entrada: Date, salida: Date | null): number | null {
  if (!salida) return null;
  const s = Math.round((salida.getTime() - entrada.getTime()) / 1000);
  if (s < 0) return null;
  return Math.min(s, MAX_DURACION_VISITA_SEG);
}

export const CODIGO_PANTALLA = /^0x[0-9A-F]{4}$/;
