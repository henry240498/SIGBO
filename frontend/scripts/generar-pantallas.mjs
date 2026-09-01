/**
 * Genera src/lib/pantallas.generado.ts recorriendo el arbol de rutas.
 *
 * Con 15 modulos y ~114 pantallas, el menu lateral solo llega al modulo: para saltar a
 * "Inventarios fisicos" hay que entrar a Deposito y buscar la pestana. Este registro es
 * lo que alimenta las migas de pan y el buscador (Ctrl+K).
 *
 * Se genera en vez de escribirse a mano para que no se desincronice del arbol: si
 * alguien agrega una pantalla y no lo corre, el buscador no la encuentra.
 *
 * Correr: npm run generar:pantallas
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const RAIZ = join(process.cwd(), 'src', 'app', 'dashboard');

/** Etiquetas legibles que los submenus ya declaran en su array TABS. */
async function etiquetasDeLosSubmenus(dir, mapa = new Map()) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) await etiquetasDeLosSubmenus(r, mapa);
    else if (e.name === 'layout.tsx') {
      const src = await readFile(r, 'utf8');
      for (const m of src.matchAll(/href: '([^']+)',\s*label: '([^']+)'/g)) mapa.set(m[1], m[2]);
    }
  }
  return mapa;
}

const CON_ACENTO = new Map(Object.entries({
  'organizacion': 'Organización', 'deposito': 'Depósito', 'vehiculos': 'Vehículos',
  'academia': 'Academia', 'documentos': 'Documentos', 'inteligencia': 'Inteligencia artificial',
  'mi-perfil': 'Mi perfil', 'seguridad': 'Seguridad', 'guardias': 'Guardias',
}));

/** Rutas anidadas cuyo ultimo segmento no se explica solo ("Nuevo", "Configuracion"). */
const NOMBRES_POR_RUTA = new Map(Object.entries({
  '/dashboard/personal/nuevo': 'Nuevo bombero',
  '/dashboard/servicios/nuevo': 'Nuevo servicio',
  '/dashboard/guardias/ordenes/nueva': 'Nueva orden de guardia',
  '/dashboard/guardias/ordenes/configuracion': 'Configuración de órdenes',
  '/dashboard/organizacion/guardias/planificacion': 'Planificación de guardias',
  '/dashboard/seguridad/inteligencia-artificial': 'Inteligencia artificial',
  '/dashboard/seguridad/inteligencia-artificial/auditoria': 'Auditoría de IA',
  '/dashboard/seguridad/inteligencia-artificial/configuracion': 'Configuración de IA',
}));

function titulizar(slug) {
  if (CON_ACENTO.has(slug)) return CON_ACENTO.get(slug);
  const texto = slug.replace(/-/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

async function rutas(dir, acumulado = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) await rutas(r, acumulado);
    else if (e.name === 'page.tsx') acumulado.push(r);
  }
  return acumulado;
}

const etiquetas = await etiquetasDeLosSubmenus(RAIZ);
const archivos = await rutas(RAIZ);
const pantallas = [];

for (const archivo of archivos) {
  const segmentos = relative(join(process.cwd(), 'src', 'app'), archivo).split(sep).slice(0, -1);
  // Las pantallas de detalle ([id]) y el catch-all no son destinos a los que se salte.
  if (segmentos.some((s) => s.startsWith('['))) continue;
  const ruta = '/' + segmentos.join('/');
  const modulo = segmentos[1] ?? 'inicio';
  const nombre = NOMBRES_POR_RUTA.get(ruta)
    ?? etiquetas.get(ruta)
    ?? (segmentos.length === 1 ? 'Inicio' : titulizar(segmentos[segmentos.length - 1]));
  pantallas.push({ ruta, nombre, modulo });
}

pantallas.sort((a, b) => a.ruta.localeCompare(b.ruta));

const salida = `// GENERADO por scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: npm run generar:pantallas

export interface PantallaRegistrada {
  /** Ruta absoluta, tal cual la espera next/link. */
  ruta: string;
  /** Nombre legible: el del submenu si existe, si no derivado del slug. */
  nombre: string;
  /** Slug del modulo al que pertenece, para filtrar por permisos. */
  modulo: string;
}

export const PANTALLAS: PantallaRegistrada[] = ${JSON.stringify(pantallas, null, 2)};
`;

await writeFile(join(process.cwd(), 'src', 'lib', 'pantallas.generado.ts'), salida, 'utf8');
console.log(`${pantallas.length} pantallas registradas en src/lib/pantallas.generado.ts`);
