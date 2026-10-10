/** Agrupacion y busqueda de la administracion de reglas por pantalla (Seguridad › Pantallas). */

export interface FilaPantalla { codigo: string; nombre: string; descripcion: string | null; confidencialAplica: boolean; activa: boolean }
/** compartidaCon: cuantas OTRAS pantallas usan la misma ruta (0 si es exenta). */
export interface RutaApiAdmin { metodo: string; patron: string; permisos: string[]; exenta: boolean; compartidaCon?: number }
export interface PantallaCatalogoAdmin { codigo: string; nombre: string; ruta: string; modulo: string; tipo: 'WEB' | 'SECCION'; rutasApi: RutaApiAdmin[] }
export interface PantallaAdmin extends FilaPantalla { ruta: string | null; rutasApi: RutaApiAdmin[]; tipo: 'WEB' | 'SECCION' | 'MOVIL' }
export interface GrupoAdmin { clave: string; titulo: string; pantallas: PantallaAdmin[] }

const sinAcentos = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function agruparPantallas(filas: FilaPantalla[], catalogo: PantallaCatalogoAdmin[], nombresModulo: Record<string, string>): GrupoAdmin[] {
  const porCodigo = new Map(catalogo.map((c) => [c.codigo, c]));
  const grupos = new Map<string, GrupoAdmin>();
  for (const f of filas.filter((x) => x.activa)) {
    const c = porCodigo.get(f.codigo);
    // Solo las 0xA son de la app movil; una web ausente del catalogo va aparte, no a "App movil".
    const tipo: PantallaAdmin['tipo'] = c ? c.tipo : f.codigo.startsWith('0xA') ? 'MOVIL' : 'WEB';
    const clave = c ? c.modulo : tipo === 'MOVIL' ? 'app-movil' : 'sin-catalogo';
    const titulo = !c ? (tipo === 'MOVIL' ? 'App móvil' : 'Sin catálogo') : clave === 'centro-mando' ? 'Centro de mando' : nombresModulo[clave] ?? clave;
    const grupo = grupos.get(clave) ?? { clave, titulo, pantallas: [] };
    grupo.pantallas.push({ ...f, ruta: c?.ruta ?? null, rutasApi: c?.rutasApi ?? [], tipo });
    grupos.set(clave, grupo);
  }
  const lista = [...grupos.values()];
  for (const g of lista) g.pantallas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  // Al final: las sin catalogo y, ultima, la app movil (otro canal, con sus propias pantallas).
  const rango = (g: GrupoAdmin) => (g.clave === 'app-movil' ? 2 : g.clave === 'sin-catalogo' ? 1 : 0);
  return lista.sort((a, b) => rango(a) - rango(b) || a.titulo.localeCompare(b.titulo, 'es'));
}

/**
 * Como se lee la columna "Matriz" de una ruta: una ruta pasa si ALGUNA pantalla la permite,
 * asi que en una compartida denegar esta pantalla no la bloquea mientras otra permitida la use.
 */
export function efectoDeLaMatriz(r: RutaApiAdmin): { texto: string; fondo: string; detalle: string | null } {
  if (r.exenta) return { texto: 'exenta', fondo: 'var(--neutral-fill)', detalle: null };
  const otras = r.compartidaCon ?? 0;
  if (otras > 0) {
    return {
      texto: `compartida con ${otras} ${otras === 1 ? 'pantalla' : 'pantallas'}`,
      fondo: 'var(--warn-fill)',
      detalle: 'denegar esta no la bloquea si otra permitida la usa',
    };
  }
  return { texto: 'aplica', fondo: 'var(--info-fill)', detalle: null };
}

/**
 * Las reglas a mostrar para la pantalla elegida. Si la persona cambia de pantalla mientras
 * llega la respuesta, una respuesta de otra pantalla no se muestra: "Quitar" borraria la
 * regla de otra pantalla mientras el dialogo nombra la actual.
 */
export function reglasDeLaPantalla<T extends { pantallaCodigo: string }>(reglas: T[], codigo: string): T[] {
  return codigo ? reglas.filter((r) => r.pantallaCodigo === codigo) : [];
}

export function filtrarGrupos(grupos: GrupoAdmin[], texto: string): GrupoAdmin[] {
  const t = sinAcentos(texto.trim());
  if (!t) return grupos;
  return grupos
    .map((g) => ({ ...g, pantallas: g.pantallas.filter((p) => [p.nombre, p.codigo, p.ruta ?? '', g.titulo].some((x) => sinAcentos(x).includes(t))) }))
    .filter((g) => g.pantallas.length > 0);
}
