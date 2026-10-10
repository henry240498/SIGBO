import type { PantallaPermiso } from '../../shared/entities';
import { AccionPantalla, reglaAplica, SujetoUsuario } from './pantallas.logica';

/**
 * Matriz de permisos por pantalla aplicada a la web (spec 2026-10-09 §4).
 * Logica pura: cruzar lo que llama cada pantalla con las rutas reales del backend y
 * decidir con las reglas de seguridad.pantalla_permisos. La matriz SOLO restringe:
 * el permiso por rol de cada endpoint se exige antes, en PermissionsGuard.
 */

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export const METODOS: MetodoHttp[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
export type AccionUi = 'ver' | 'crear' | 'editar' | 'eliminar';

/** Una ruta real del backend, sin el prefijo /api/v1 (los parametros como `:id`). */
export interface RutaBackend { metodo: MetodoHttp; patron: string; permisos: string[] }

/** Una llamada que hace una pantalla, tal como la escribio el frontend (`*` = segmento variable). */
export interface LlamadaApi { metodos: MetodoHttp[]; patron: string }

export interface PantallaCatalogo {
  codigo: string;
  ruta: string;
  nombre: string;
  modulo: string;
  /** Prefijo de permisos del modulo (p. ej. 'personal:'); null si la pantalla no depende de uno. */
  prefijo: string | null;
  llamadas: LlamadaApi[];
}

/** Rutas cuya accion no es la que sugiere el metodo (p. ej. un POST que solo calcula). */
export interface AccionForzada { metodo: MetodoHttp; patron: string; accion: AccionPantalla }

export interface IndiceMatriz {
  /** 'GET /personal/bomberos/:id' -> codigos de las pantallas que la usan. */
  pantallasPorRuta: Map<string, string[]>;
  /** Codigo -> rutas del backend que usa (incluidas las exentas, para su permiso base). */
  rutasPorPantalla: Map<string, RutaBackend[]>;
  sinResolver: Array<{ codigo: string; llamada: LlamadaApi }>;
}

export const PREFIJO_API = '/api/v1';

export const VERBO_ACCION: Record<AccionPantalla, string> = {
  ver: 'ver', crear: 'crear', editar: 'editar', eliminar: 'eliminar', confidencial: 'ver información confidencial',
};

export function segmentos(patron: string): string[] {
  return patron.split('/').filter(Boolean);
}

export function normalizarPatron(patron: string): string {
  return '/' + segmentos(patron).join('/');
}

/** Patron de Express ('/api/v1/personal/bomberos/:id') sin el prefijo global. */
export function sinPrefijo(rutaExpress: string): string {
  const p = normalizarPatron(rutaExpress);
  if (p === PREFIJO_API) return '/';
  return p.startsWith(`${PREFIJO_API}/`) ? p.slice(PREFIJO_API.length) : p;
}

export const claveRuta = (metodo: string, patron: string) => `${metodo.toUpperCase()} ${normalizarPatron(patron)}`;

function coincide(llamada: string[], ruta: string[], flexible: boolean): boolean {
  if (llamada.length !== ruta.length) return false;
  return llamada.every((s, i) => {
    const esParametro = ruta[i].startsWith(':');
    if (s === '*') return esParametro || flexible;
    return s === ruta[i] || (flexible && esParametro);
  });
}

/**
 * Rutas del backend que corresponden a una llamada. Primero las exactas (`*` solo contra
 * parametros, literal contra literal); si no hay ninguna, las flexibles.
 */
export function resolverLlamada(llamada: LlamadaApi, rutas: RutaBackend[]): RutaBackend[] {
  const seg = segmentos(llamada.patron);
  const candidatas = rutas.filter((r) => llamada.metodos.includes(r.metodo));
  const exactas = candidatas.filter((r) => coincide(seg, segmentos(r.patron), false));
  return exactas.length ? exactas : candidatas.filter((r) => coincide(seg, segmentos(r.patron), true));
}

/**
 * Rutas que la matriz nunca bloquea: administrar la propia matriz (si no, una regla mal
 * puesta dejaria al administrador sin forma de quitarla), la sesion, la salud, el perfil
 * propio y el Centro de mando (que decide seccion por seccion).
 */
const EXENTAS: RegExp[] = [
  /^\/pantallas(\/|$)/, /^\/auth(\/|$)/, /^\/salud(\/|$)/, /^\/centro-mando(\/|$)/,
  /^\/seguridad\/mi-perfil(\/|$)/, /^\/seguridad\/mi-inicio$/,
  /^\/configuracion\/publica$/, /^\/configuracion\/mis-preferencias$/,
];

export function esExenta(patron: string): boolean {
  const p = normalizarPatron(patron);
  return EXENTAS.some((re) => re.test(p));
}

export function construirIndice(pantallas: PantallaCatalogo[], rutas: RutaBackend[]): IndiceMatriz {
  const pantallasPorRuta = new Map<string, string[]>();
  const rutasPorPantalla = new Map<string, RutaBackend[]>();
  const sinResolver: IndiceMatriz['sinResolver'] = [];
  for (const p of pantallas) {
    const propias: RutaBackend[] = [];
    for (const llamada of p.llamadas) {
      const encontradas = resolverLlamada(llamada, rutas);
      if (!encontradas.length) sinResolver.push({ codigo: p.codigo, llamada });
      for (const r of encontradas) if (!propias.includes(r)) propias.push(r);
    }
    rutasPorPantalla.set(p.codigo, propias);
    for (const r of propias) {
      if (esExenta(r.patron)) continue;
      const clave = claveRuta(r.metodo, r.patron);
      const lista = pantallasPorRuta.get(clave) ?? [];
      if (!lista.includes(p.codigo)) lista.push(p.codigo);
      pantallasPorRuta.set(clave, lista);
    }
  }
  return { pantallasPorRuta, rutasPorPantalla, sinResolver };
}

const ACCION_POR_METODO: Record<string, AccionPantalla> = {
  GET: 'ver', HEAD: 'ver', POST: 'crear', PUT: 'editar', PATCH: 'editar', DELETE: 'eliminar',
};

export function accionDe(metodo: string, patron: string, forzadas: AccionForzada[]): AccionPantalla | null {
  const m = metodo.toUpperCase();
  const forzada = forzadas.find((f) => f.metodo === m && normalizarPatron(f.patron) === normalizarPatron(patron));
  return forzada?.accion ?? ACCION_POR_METODO[m] ?? null;
}

export interface DecisionApi { permitido: boolean; codigoDenegado: string | null }

/**
 * Decide una llamada a la API. Se permite si ALGUNA de las pantallas que usan la ruta lo
 * permite a esta persona: sin reglas que le apliquen, o sin denegacion y con alguna regla
 * que conceda la accion. Una ruta compartida (combos, catalogos) sigue disponible
 * mientras otra pantalla permitida la use.
 */
export function decidirApi(codigos: string[], accion: AccionPantalla, reglas: PantallaPermiso[], sujeto: SujetoUsuario): DecisionApi {
  if (!codigos.length) return { permitido: true, codigoDenegado: null };
  let denegado: string | null = null;
  for (const codigo of codigos) {
    const aplicables = reglas.filter((r) => r.pantallaCodigo === codigo && reglaAplica(r, sujeto));
    if (!aplicables.length) return { permitido: true, codigoDenegado: null };
    if (!aplicables.some((r) => r.denegar) && aplicables.some((r) => !!r[accion])) return { permitido: true, codigoDenegado: null };
    denegado ??= codigo;
  }
  return { permitido: false, codigoDenegado: denegado };
}

/** Lo que hace falta, por rol, para ofrecer una accion en la interfaz. */
export interface BaseUi {
  siempre: boolean;
  /** No hay nada que hacer (p. ej. "eliminar" en una pantalla sin DELETE). */
  nunca: boolean;
  /** Alguno de estos permisos; vacio = no exige permiso. */
  algunoDe: string[];
  /** Algun permiso que empiece asi (el prefijo del modulo); null = no exige. */
  prefijo: string | null;
}

export function tieneBase(base: BaseUi, permisos: string[]): boolean {
  if (base.nunca) return false;
  if (base.siempre) return true;
  const porPrefijo = base.prefijo === null || permisos.some((p) => p.startsWith(base.prefijo as string));
  const porPermiso = base.algunoDe.length === 0 || base.algunoDe.some((p) => permisos.includes(p));
  return porPrefijo && porPermiso;
}

const METODOS_DE: Record<AccionUi, MetodoHttp[]> = { ver: ['GET'], crear: ['POST'], editar: ['PUT', 'PATCH'], eliminar: ['DELETE'] };

/**
 * Permiso base de una accion de una pantalla: "ver" exige el prefijo del modulo y alguno de
 * los permisos de sus GET; crear/editar/eliminar, alguno de los permisos de las rutas de
 * esa accion. Una ruta sin permiso (abierta) no exige permiso.
 */
export function baseDePantalla(p: Pick<PantallaCatalogo, 'prefijo'>, rutas: RutaBackend[], accion: AccionUi, forzadas: AccionForzada[]): BaseUi {
  const propias = rutas.filter((r) => accionDe(r.metodo, r.patron, forzadas) === accion
    || (accionDe(r.metodo, r.patron, forzadas) === null && METODOS_DE[accion].includes(r.metodo)));
  if (accion !== 'ver' && propias.length === 0) return { siempre: false, nunca: true, algunoDe: [], prefijo: null };
  const abierta = propias.some((r) => r.permisos.length === 0);
  return {
    siempre: false,
    nunca: false,
    algunoDe: abierta ? [] : [...new Set(propias.flatMap((r) => r.permisos))],
    prefijo: accion === 'ver' ? p.prefijo : null,
  };
}

export interface DecisionUi { permitido: boolean; origen: 'ROL' | 'REGLA' }

export function decidirUiDetalle(base: BaseUi, accion: AccionPantalla, permisos: string[], reglasDeLaPantalla: PantallaPermiso[], sujeto: SujetoUsuario): DecisionUi {
  if (!tieneBase(base, permisos)) return { permitido: false, origen: 'ROL' };
  const aplicables = reglasDeLaPantalla.filter((r) => reglaAplica(r, sujeto));
  if (!aplicables.length) return { permitido: true, origen: 'ROL' };
  if (aplicables.some((r) => r.denegar)) return { permitido: false, origen: 'REGLA' };
  return { permitido: aplicables.some((r) => !!r[accion]), origen: 'REGLA' };
}

export function decidirUi(base: BaseUi, accion: AccionPantalla, permisos: string[], reglasDeLaPantalla: PantallaPermiso[], sujeto: SujetoUsuario): boolean {
  return decidirUiDetalle(base, accion, permisos, reglasDeLaPantalla, sujeto).permitido;
}
