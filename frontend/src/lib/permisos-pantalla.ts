import type { ModuloConfig } from './modulos';
import type { PantallaRegistrada } from './pantallas.generado';

/**
 * Como aplica la web la matriz de permisos por pantalla (spec 2026-10-09 §4.5).
 * La web solo OCULTA: quien decide es el backend. Por eso, si la matriz no se pudo
 * cargar, nada se bloquea aca y el menu vuelve a la logica por prefijo de siempre.
 */

export type AccionUi = 'ver' | 'crear' | 'editar' | 'eliminar';

export interface PermisoPantalla {
  codigo: string;
  ruta: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

/** Decisiones de la matriz indexadas por ruta registrada ('/dashboard/personal/[id]'). */
export type MatrizWeb = Map<string, PermisoPantalla>;

export function indexarPorRuta(lista: PermisoPantalla[]): MatrizWeb {
  return new Map(lista.map((p) => [p.ruta, p]));
}

const tramos = (ruta: string) => ruta.split('?')[0].split('/').filter(Boolean);

/** ¿La ruta registrada (con [parametro]) corresponde a este pathname? */
export function rutaCoincide(patron: string, pathname: string): boolean {
  const a = tramos(patron);
  const b = tramos(pathname);
  return a.length === b.length && a.every((s, i) => s.startsWith('[') || s === b[i]);
}

/** Pantalla registrada para un pathname: la exacta, si no la de detalle que coincida. */
export function pantallaDeRuta(pathname: string, pantallas: PantallaRegistrada[]): PantallaRegistrada | undefined {
  const limpio = '/' + tramos(pathname).join('/');
  return pantallas.find((p) => p.ruta === limpio) ?? pantallas.find((p) => p.detalle && rutaCoincide(p.ruta, limpio));
}

/** Decision de la matriz para un pathname; null si esta fuera de la matriz o no hay datos. */
export function decisionDeRuta(pathname: string, pantallas: PantallaRegistrada[], matriz: MatrizWeb | null): PermisoPantalla | null {
  if (!matriz) return null;
  const p = pantallaDeRuta(pathname, pantallas);
  if (!p || !p.codigo) return null;
  return matriz.get(p.ruta) ?? null;
}

export function puede(pathname: string, pantallas: PantallaRegistrada[], matriz: MatrizWeb | null, accion: AccionUi): boolean {
  const d = decisionDeRuta(pathname, pantallas, matriz);
  return d ? d[accion] : true;
}

const porPrefijo = (m: ModuloConfig, permisos: string[]) =>
  m.permisoPrefijo === '' || permisos.some((p) => p.startsWith(m.permisoPrefijo));

/** Un modulo va en el menu si alguna de sus pantallas se puede ver; sin datos, por prefijo. */
export function moduloVisibleEnMenu(m: ModuloConfig, permisos: string[], pantallas: PantallaRegistrada[], matriz: MatrizWeb | null): boolean {
  if (!matriz) return porPrefijo(m, permisos);
  const propias = pantallas.filter((p) => p.modulo === m.slug && p.codigo && !p.detalle);
  if (!propias.length) return porPrefijo(m, permisos);
  return propias.some((p) => matriz.get(p.ruta)?.ver === true);
}

/** Pestanas de un modulo que la persona puede abrir; sin datos, todas (como antes). */
export function tabsVisibles<T extends { href: string }>(tabs: T[], pantallas: PantallaRegistrada[], matriz: MatrizWeb | null): T[] {
  if (!matriz) return tabs;
  return tabs.filter((t) => decisionDeRuta(t.href, pantallas, matriz)?.ver ?? true);
}

const SIEMPRE_VISIBLES = new Set(['inicio', 'mi-perfil', 'reportar']);

/** Pantallas para el buscador y los accesos rapidos (sin las de detalle). */
export function pantallasVisibles(pantallas: PantallaRegistrada[], permisos: string[], matriz: MatrizWeb | null, modulos: ModuloConfig[]): PantallaRegistrada[] {
  return pantallas.filter((p) => !p.detalle).filter((p) => {
    // Solo estas pantallas son siempre visibles; otra sin codigo (p. ej. Seguridad > Pantallas)
    // sigue el prefijo de su modulo.
    const m = modulos.find((x) => x.slug === p.modulo);
    if (!p.codigo) return SIEMPRE_VISIBLES.has(p.modulo) || (m ? porPrefijo(m, permisos) : false);
    if (matriz) return matriz.get(p.ruta)?.ver === true;
    return m ? porPrefijo(m, permisos) : false;
  });
}
