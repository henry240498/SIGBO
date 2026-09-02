/**
 * Cruza los endpoints que llama el frontend contra las rutas que declara el backend.
 *
 * Una ruta mal escrita en el frontend no la detecta `tsc`: es una cadena. Aparece recien
 * como un 404 en ejecucion, y solo si alguien abre esa pantalla. Este script lo encuentra
 * sin levantar nada.
 *
 * Correr: node scripts/verificar-endpoints.mjs [--seccion <prefijo>]
 * Sale 1 si hay llamadas del frontend sin ruta en el backend.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const RAIZ = process.cwd();
const BACK = join(RAIZ, 'backend', 'src');
const FRONT = join(RAIZ, 'frontend', 'src');

const filtro = process.argv.includes('--seccion')
  ? process.argv[process.argv.indexOf('--seccion') + 1]
  : null;

async function archivos(dir, sufijo, acc = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) await archivos(r, sufijo, acc);
    else if (e.name.endsWith(sufijo)) acc.push(r);
  }
  return acc;
}

/* ---------- 1. Rutas que declara el backend ---------- */

const VERBOS = ['Get', 'Post', 'Patch', 'Put', 'Delete'];
const rutasBackend = [];

for (const archivo of await archivos(BACK, '.controller.ts')) {
  const src = await readFile(archivo, 'utf8');
  // Un archivo puede declarar varios @Controller (ia-configuracion.controller.ts tiene
  // 'ia/admin/config' y 'ia/admin/estado'): cada ruta toma el @Controller anterior mas
  // cercano, no el primero del archivo.
  const bases = [...src.matchAll(/@Controller\('([^']*)'\)/g)].map((c) => ({ prefijo: c[1], desde: c.index }));
  const baseDe = (pos) => {
    let elegida = '';
    for (const b of bases) { if (b.desde < pos) elegida = b.prefijo; else break; }
    return elegida;
  };
  // Se ubican todos los decoradores de verbo y se corta por posiciones. Buscar el
  // permiso dentro de una ventana fija fallaba cuando entre dos rutas hay un
  // @UseInterceptors largo: el match no llegaba al lookahead y se salteaba la ruta.
  const re = new RegExp(`@(${VERBOS.join('|')})\\((?:'([^']*)')?\\)`, 'g');
  const marcas = [];
  let m;
  while ((m = re.exec(src)) !== null) marcas.push({ verbo: m[1], sub: m[2] ?? '', desde: m.index });

  for (let i = 0; i < marcas.length; i += 1) {
    const { verbo, sub } = marcas[i];
    const hasta = i + 1 < marcas.length ? marcas[i + 1].desde : src.length;
    const cola = src.slice(marcas[i].desde, hasta);
    const permiso = cola.match(/@RequirePermission\('([^']+)'\)/)?.[1] ?? null;
    const ruta = ('/' + [baseDe(marcas[i].desde), sub].filter(Boolean).join('/')).replace(/\/+/g, '/');
    rutasBackend.push({
      verbo: verbo.toUpperCase(),
      ruta,
      permiso,
      archivo: relative(RAIZ, archivo),
      // Patron para comparar: :param -> comodin
      patron: new RegExp('^' + ruta.replace(/:[A-Za-z0-9_]+/g, '[^/]+') + '$'),
    });
  }
}

/* ---------- 2. Llamadas que hace el frontend ---------- */

const llamadas = [];
const RE_FETCH = /apiFetch\(\s*(`[^`]*`|'[^']*')\s*(?:,\s*\{([\s\S]{0,200}?)\})?/g;

const fuentesFront = [...(await archivos(FRONT, '.tsx')), ...(await archivos(FRONT, '.ts'))];
for (const archivo of fuentesFront) {
  const rel = relative(RAIZ, archivo);
  if (filtro && !rel.includes(filtro)) continue;
  const src = await readFile(archivo, 'utf8');
  let m;
  RE_FETCH.lastIndex = 0;
  while ((m = RE_FETCH.exec(src)) !== null) {
    const crudo = m[1].slice(1, -1);
    const metodo = m[2]?.match(/method:\s*'([A-Z]+)'/)?.[1] ?? 'GET';
    // `${x}` -> comodin, y se corta la query string.
    const ruta = crudo.replace(/\$\{[^}]*\}/g, 'X').split('?')[0].replace(/\/+$/, '') || '/';
    llamadas.push({ metodo, ruta, crudo, archivo: rel });
  }
}

/* ---------- 3. Cruce ---------- */

const sinRuta = [];
const resueltas = [];
for (const ll of llamadas) {
  const base = ll.ruta.replace(/X/g, 'x');
  // Un `${params}` pegado al final del path es la query string armada aparte
  // (`/finanzas/cajas${params}`), no un segmento: se prueba tambien sin esa cola.
  const variantes = [base, base.replace(/x$/, '').replace(/\/$/, '')];
  const cand = rutasBackend.filter((r) => r.verbo === ll.metodo && variantes.some((v) => r.patron.test(v)));
  if (cand.length === 0) sinRuta.push(ll);
  else resueltas.push({ ...ll, permiso: cand[0].permiso, backend: cand[0].archivo });
}

const unicas = (arr, clave) => [...new Map(arr.map((x) => [clave(x), x])).values()];
const llamadasUnicas = unicas(llamadas, (x) => `${x.metodo} ${x.ruta}`);
const sinRutaUnicas = unicas(sinRuta, (x) => `${x.metodo} ${x.ruta}`);

console.log(`Rutas declaradas en el backend : ${rutasBackend.length}`);
console.log(`Llamadas distintas del frontend: ${llamadasUnicas.length}${filtro ? ` (filtro: ${filtro})` : ''}`);
console.log(`Resueltas contra el backend    : ${llamadasUnicas.length - sinRutaUnicas.length}`);
console.log(`SIN RUTA en el backend         : ${sinRutaUnicas.length}`);

if (sinRutaUnicas.length) {
  console.log('\nLlamadas que no encuentran ruta:');
  for (const s of sinRutaUnicas.sort((a, b) => a.ruta.localeCompare(b.ruta))) {
    console.log(`  ${s.metodo.padEnd(6)} ${s.crudo}`);
    console.log(`         ${s.archivo}`);
  }
}

if (process.argv.includes('--permisos')) {
  console.log('\nPermiso por endpoint resuelto:');
  for (const r of unicas(resueltas, (x) => `${x.metodo} ${x.ruta}`).sort((a, b) => a.ruta.localeCompare(b.ruta))) {
    console.log(`  ${r.metodo.padEnd(6)} ${r.ruta.padEnd(58)} ${r.permiso ?? '(SIN @RequirePermission)'}`);
  }
}

process.exit(sinRutaUnicas.length > 0 ? 1 : 0);
