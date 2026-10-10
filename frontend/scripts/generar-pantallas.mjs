/**
 * Genera el catálogo de pantallas recorriendo el árbol de rutas:
 *  - src/lib/pantallas.generado.ts: migas de pan, buscador (Ctrl+K) y matriz en la web;
 *  - ../backend/src/modules/pantallas/catalogo-web.generado.ts: qué rutas de la API llama
 *    cada pantalla, para que el backend aplique la matriz de permisos por pantalla.
 * Los códigos de pantalla viven en scripts/pantallas-codigos.json y nunca se renumeran.
 *
 * Correr: npm run generar:pantallas        (escribe)
 *         npm run verificar:pantallas      (falla si lo generado no está al día; lo usa CI)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { asignarCodigos, extraerLlamadas, FUERA_DE_LA_MATRIZ, importsLocales, prefijosDeModulos } from './lib/catalogo-pantallas.mjs';

const VERIFICAR = process.argv.includes('--verificar');
const FRONT = process.cwd();
const SRC = join(FRONT, 'src');
const RAIZ = join(SRC, 'app', 'dashboard');
const SALIDA_FRONT = join(SRC, 'lib', 'pantallas.generado.ts');
const SALIDA_BACK = join(FRONT, '..', 'backend', 'src', 'modules', 'pantallas', 'catalogo-web.generado.ts');
const CODIGOS = join(FRONT, 'scripts', 'pantallas-codigos.json');
const EXTRA = join(FRONT, 'scripts', 'pantallas-api-extra.json');
const NO_RECORRER = new Set([join(SRC, 'lib', 'api.ts'), SALIDA_FRONT]);

/** Etiquetas legibles que los submenús ya declaran en su array TABS. */
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

/** Rutas cuyo último segmento no se explica solo ("Nuevo", "[id]"). */
const NOMBRES_POR_RUTA = new Map(Object.entries({
  '/dashboard/personal/nuevo': 'Nuevo bombero',
  '/dashboard/servicios/nuevo': 'Nuevo servicio',
  '/dashboard/guardias/ordenes/nueva': 'Nueva orden de guardia',
  '/dashboard/guardias/ordenes/configuracion': 'Configuración de órdenes',
  '/dashboard/seguridad/inteligencia-artificial': 'Inteligencia artificial',
  '/dashboard/seguridad/inteligencia-artificial/auditoria': 'Auditoría de IA',
  '/dashboard/seguridad/inteligencia-artificial/configuracion': 'Configuración de IA',
  '/dashboard/centro-mando': 'Centro de mando',
  '/dashboard/personal/[id]': 'Legajo del bombero',
  '/dashboard/academia/[id]': 'Detalle de curso',
  '/dashboard/asistencia/eventos/[id]': 'Detalle de evento de asistencia',
  '/dashboard/denuncias/[id]': 'Detalle de denuncia',
  '/dashboard/deposito/articulos/[id]': 'Ficha de artículo',
  '/dashboard/deposito/inventarios-fisicos/[id]': 'Detalle de inventario físico',
  '/dashboard/documentos/[id]': 'Detalle de documento',
  '/dashboard/documentos/expedientes/[id]': 'Detalle de expediente',
  '/dashboard/equipos/[id]': 'Ficha de equipo',
  '/dashboard/finanzas/socios-protectores/[id]': 'Ficha de socio protector',
  '/dashboard/guardias/[id]': 'Detalle de guardia',
  '/dashboard/guardias/grupos/[id]': 'Detalle de grupo de guardia',
  '/dashboard/guardias/ordenes/[id]': 'Detalle de orden de guardia',
  '/dashboard/guardias/sorteos/[id]': 'Detalle de sorteo',
  '/dashboard/seguridad/usuarios/[id]': 'Ficha de usuario',
  '/dashboard/vehiculos/[id]': 'Ficha de vehículo',
}));

function titulizar(slug) {
  if (CON_ACENTO.has(slug)) return CON_ACENTO.get(slug);
  const texto = slug.replace(/-/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function nombreDeRuta(ruta, etiquetas) {
  if (NOMBRES_POR_RUTA.has(ruta)) return NOMBRES_POR_RUTA.get(ruta);
  if (etiquetas.has(ruta)) return etiquetas.get(ruta);
  const segmentos = ruta.split('/').filter(Boolean);
  if (segmentos.length === 1) return 'Inicio';
  const ultimo = segmentos[segmentos.length - 1];
  if (ultimo.startsWith('[')) return `${nombreDeRuta('/' + segmentos.slice(0, -1).join('/'), etiquetas)} › Detalle`;
  return titulizar(ultimo);
}

async function paginas(dir, acumulado = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) await paginas(r, acumulado);
    else if (e.name === 'page.tsx') acumulado.push(r);
  }
  return acumulado;
}

function resolverImport(desde, especificador) {
  const base = especificador.startsWith('@/') ? join(SRC, especificador.slice(2)) : resolve(dirname(desde), especificador);
  for (const c of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (/\.(ts|tsx)$/.test(c) && existsSync(c)) return c;
  }
  return null;
}

const posix = (p) => relative(FRONT, p).split(sep).join('/');

/** Llamadas de una página y de todo lo que importa dentro de src/ (componentes, lib). */
async function llamadasDePagina(archivo) {
  const visitados = new Set();
  const pendientes = [archivo];
  const porPatron = new Map();
  const sinResolver = [];
  while (pendientes.length) {
    const actual = pendientes.pop();
    if (visitados.has(actual) || NO_RECORRER.has(actual)) continue;
    visitados.add(actual);
    const fuente = await readFile(actual, 'utf8');
    const r = extraerLlamadas(fuente);
    for (const ll of r.llamadas) {
      const s = porPatron.get(ll.patron) ?? new Set();
      ll.metodos.forEach((m) => s.add(m));
      porPatron.set(ll.patron, s);
    }
    for (const texto of r.sinResolver) sinResolver.push(`${posix(actual)}: ${texto}`);
    for (const imp of importsLocales(fuente)) {
      const destino = resolverImport(actual, imp);
      if (destino && destino.startsWith(SRC)) pendientes.push(destino);
    }
  }
  const llamadas = [...porPatron].map(([patron, s]) => ({ metodos: [...s].sort(), patron })).sort((a, b) => a.patron.localeCompare(b.patron));
  return { llamadas, sinResolver };
}

const etiquetas = await etiquetasDeLosSubmenus(RAIZ);
const prefijos = prefijosDeModulos(await readFile(join(SRC, 'lib', 'modulos.ts'), 'utf8'));
const extra = JSON.parse(await readFile(EXTRA, 'utf8'));
const previos = JSON.parse(await readFile(CODIGOS, 'utf8'));

const pantallas = [];
for (const archivo of await paginas(RAIZ)) {
  const segmentos = relative(join(SRC, 'app'), archivo).split(sep).slice(0, -1);
  const ruta = '/' + segmentos.join('/');
  if (ruta === '/dashboard/[modulo]') continue;
  pantallas.push({ archivo, ruta, nombre: nombreDeRuta(ruta, etiquetas), modulo: segmentos[1] ?? 'inicio', detalle: segmentos.some((s) => s.startsWith('[')) });
}
pantallas.sort((a, b) => a.ruta.localeCompare(b.ruta));

const enMatriz = pantallas.filter((p) => !FUERA_DE_LA_MATRIZ.has(p.ruta));
const codigos = asignarCodigos(enMatriz.map((p) => p.ruta), previos);

const catalogo = [];
const sinResolver = [];
for (const p of enMatriz) {
  const { llamadas, sinResolver: propias } = await llamadasDePagina(p.archivo);
  const extras = extra.llamadas?.[p.ruta] ?? [];
  catalogo.push({ codigo: codigos[p.ruta], ruta: p.ruta, nombre: p.nombre, modulo: p.modulo, prefijo: prefijos[p.modulo] ?? null, llamadas: [...llamadas, ...extras] });
  for (const texto of propias) sinResolver.push({ codigo: codigos[p.ruta], ruta: p.ruta, texto });
}

const salidaFront = `// GENERADO por scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: npm run generar:pantallas

export interface PantallaRegistrada {
  /** Ruta absoluta; las de detalle llevan el parametro entre corchetes ('/dashboard/personal/[id]'). */
  ruta: string;
  /** Nombre legible: el del submenu si existe, si no derivado del slug. */
  nombre: string;
  /** Slug del modulo al que pertenece, para filtrar por permisos. */
  modulo: string;
  /** Codigo en la matriz de permisos por pantalla; null = fuera de la matriz (Inicio, Mi perfil, Reportar). */
  codigo: string | null;
  /** Pantalla de detalle (ruta con parametro): no es un destino del buscador. */
  detalle: boolean;
}

export const PANTALLAS: PantallaRegistrada[] = ${JSON.stringify(pantallas.map((p) => ({ ruta: p.ruta, nombre: p.nombre, modulo: p.modulo, codigo: codigos[p.ruta] ?? null, detalle: p.detalle })), null, 2)};
`;

const salidaBack = `// GENERADO por frontend/scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: cd frontend; npm run generar:pantallas

import type { AccionForzada, PantallaCatalogo } from './matriz-web.logica';

export const PANTALLAS_WEB: PantallaCatalogo[] = ${JSON.stringify(catalogo, null, 2)};

export const ACCIONES_FORZADAS: AccionForzada[] = ${JSON.stringify(extra.acciones ?? [], null, 2)};

/** Llamadas que el generador no pudo convertir en ruta (se ven en Sistema › Estado). */
export const LLAMADAS_SIN_RESOLVER: Array<{ codigo: string; ruta: string; texto: string }> = ${JSON.stringify(sinResolver, null, 2)};
`;

const salidaCodigos = `${JSON.stringify(codigos, null, 2)}\n`;
const archivos = [[SALIDA_FRONT, salidaFront], [SALIDA_BACK, salidaBack], [CODIGOS, salidaCodigos]];

if (VERIFICAR) {
  const desactualizados = [];
  for (const [ruta, contenido] of archivos) {
    const actual = existsSync(ruta) ? (await readFile(ruta, 'utf8')).replace(/\r\n/g, '\n') : null;
    if (actual !== contenido) desactualizados.push(posix(ruta));
  }
  if (desactualizados.length) {
    console.error(`El catálogo de pantallas no está al día: ${desactualizados.join(', ')}. Correr: npm run generar:pantallas`);
    process.exit(1);
  }
  console.log(`Catálogo al día: ${pantallas.length} pantallas, ${catalogo.length} en la matriz.`);
} else {
  for (const [ruta, contenido] of archivos) await writeFile(ruta, contenido, 'utf8');
  console.log(`${pantallas.length} pantallas registradas (${catalogo.length} en la matriz). Llamadas sin resolver: ${sinResolver.length}.`);
  for (const s of sinResolver.slice(0, 40)) console.log(`  · ${s.ruta} — ${s.texto}`);
}
