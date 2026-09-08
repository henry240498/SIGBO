import { MODULOS, ModuloConfig } from './modulos';
import { PANTALLAS, PantallaRegistrada } from './pantallas.generado';
import { coincideBusqueda } from './texto';

export interface Miga {
  nombre: string;
  /** Ausente en el ultimo tramo: es donde ya estas parado. */
  href?: string;
}

const RE_ID = /^[0-9a-fA-F-]{8,}$/;

const porRuta = new Map(PANTALLAS.map((p) => [p.ruta, p]));

/**
 * Migas de pan a partir del pathname. Antes la barra superior solo decia el nombre del
 * modulo, asi que en `/dashboard/deposito/articulos/<id>` no habia forma de saber donde
 * estabas ni de volver un nivel.
 */
export function migasDePan(pathname: string): Miga[] {
  const segmentos = pathname.split('/').filter(Boolean);
  if (segmentos[0] !== 'dashboard') return [];

  const migas: Miga[] = [{ nombre: 'Inicio', href: '/dashboard' }];
  let acumulada = '/dashboard';

  for (const segmento of segmentos.slice(1)) {
    acumulada += `/${segmento}`;
    // Un id en la ruta es una ficha concreta, no una pantalla del registro.
    if (RE_ID.test(segmento)) {
      migas.push({ nombre: 'Detalle' });
      continue;
    }
    const pantalla = porRuta.get(acumulada);
    const modulo = MODULOS.find((m) => m.slug === segmento);
    migas.push({
      nombre: pantalla?.nombre ?? modulo?.nombre ?? titulizar(segmento),
      href: acumulada,
    });
  }

  // El ultimo tramo es la pagina actual: se muestra sin enlace.
  const ultima = migas[migas.length - 1];
  if (ultima) delete ultima.href;
  return migas;
}

function titulizar(slug: string): string {
  const texto = slug.replace(/-/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** El modulo al que pertenece una ruta, si alguno. */
export function moduloDeRuta(pathname: string): ModuloConfig | undefined {
  return MODULOS.find((m) => m.slug === pathname.split('/')[2]);
}

export interface ResultadoBusqueda extends PantallaRegistrada {
  /** Nombre del modulo, para distinguir dos pantallas que se llaman igual. */
  contexto: string;
}

/**
 * Pantallas que el usuario puede abrir, filtradas por permiso y por texto.
 * Sin argumento de busqueda devuelve todas, que es lo que ve al abrir el buscador.
 */
export function buscarPantallas(consulta: string, permisos: string[]): ResultadoBusqueda[] {
  const visibles = new Set(
    MODULOS.filter((m) => permisos.some((p) => p.startsWith(m.permisoPrefijo))).map((m) => m.slug),
  );
  const termino = consulta.trim();

  return PANTALLAS
    .filter((p) => p.modulo === 'inicio' || p.modulo === 'mi-perfil' || visibles.has(p.modulo))
    .map((p) => ({
      ...p,
      contexto: MODULOS.find((m) => m.slug === p.modulo)?.nombre ?? 'General',
    }))
    .filter((p) => !termino || coincideBusqueda(p.nombre, termino) || coincideBusqueda(p.contexto, termino))
    .slice(0, 40);
}
