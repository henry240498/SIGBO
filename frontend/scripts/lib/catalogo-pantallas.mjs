/**
 * Lógica pura del catálogo de pantallas (la usa generar-pantallas.mjs y se prueba con
 * node --test). Sin dependencias.
 *
 * Para la matriz de permisos web hace falta saber a qué rutas de la API llama cada
 * pantalla: se leen las llamadas apiFetch / descargarArchivo / fetch(`${API_URL}…`) del
 * código fuente con un lexer mínimo (cadenas, plantillas y paréntesis balanceados).
 */

export const METODOS = ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'];

/** Rutas web que no entran a la matriz: son de cada persona o no son destinos. */
export const FUERA_DE_LA_MATRIZ = new Set([
  '/dashboard', '/dashboard/mi-perfil', '/dashboard/mi-perfil/preferencias', '/dashboard/mi-perfil/seguridad', '/dashboard/reportar',
]);

const ABRE = '\u0001';
const CIERRA = '\u0002';

/** `i` apunta a la comilla de apertura; devuelve el índice siguiente al cierre. */
function saltarCadena(fuente, i) {
  const comilla = fuente[i];
  let j = i + 1;
  while (j < fuente.length) {
    const c = fuente[j];
    if (c === '\\') { j += 2; continue; }
    if (comilla === '`' && c === '$' && fuente[j + 1] === '{') { j = saltarExpresion(fuente, j + 2); continue; }
    if (c === comilla) return j + 1;
    j++;
  }
  return j;
}

/** `i` apunta justo después de `${`; devuelve el índice siguiente a la `}` que la cierra. */
function saltarExpresion(fuente, i) {
  let profundidad = 1;
  let j = i;
  while (j < fuente.length && profundidad > 0) {
    const c = fuente[j];
    if (c === '\'' || c === '"' || c === '`') { j = saltarCadena(fuente, j); continue; }
    if (c === '{') profundidad++;
    else if (c === '}') profundidad--;
    j++;
  }
  return j;
}

/** Texto entre paréntesis balanceados; `i` apunta justo después de `(`. */
function argumentosDesde(fuente, i) {
  let profundidad = 1;
  let j = i;
  while (j < fuente.length) {
    const c = fuente[j];
    if (c === '\'' || c === '"' || c === '`') { j = saltarCadena(fuente, j); continue; }
    if (c === '(' || c === '[' || c === '{') profundidad++;
    else if (c === ')' || c === ']' || c === '}') {
      profundidad--;
      if (profundidad === 0) return fuente.slice(i, j);
    }
    j++;
  }
  return null;
}

function dividirArgumentos(args) {
  const partes = [];
  let profundidad = 0;
  let inicio = 0;
  let j = 0;
  while (j < args.length) {
    const c = args[j];
    if (c === '\'' || c === '"' || c === '`') { j = saltarCadena(args, j); continue; }
    if (c === '(' || c === '[' || c === '{') profundidad++;
    else if (c === ')' || c === ']' || c === '}') profundidad--;
    else if (c === ',' && profundidad === 0) { partes.push(args.slice(inicio, j).trim()); inicio = j + 1; }
    j++;
  }
  const ultima = args.slice(inicio).trim();
  if (ultima) partes.push(ultima);
  return partes;
}

/**
 * Contenido de UN literal de cadena o plantilla, con cada `${…}` reemplazado por
 * ABRE + (el identificador, si es uno simple) + CIERRA. null si no es un literal único.
 */
function contenidoLiteral(expresion) {
  const e = expresion.trim();
  const q = e[0];
  if (q !== '\'' && q !== '"' && q !== '`') return null;
  if (saltarCadena(e, 0) !== e.length) return null;
  let salida = '';
  let j = 1;
  while (j < e.length - 1) {
    const c = e[j];
    if (c === '\\') { salida += e[j + 1] ?? ''; j += 2; continue; }
    if (q === '`' && c === '$' && e[j + 1] === '{') {
      const fin = saltarExpresion(e, j + 2);
      const interior = e.slice(j + 2, fin - 1).trim();
      salida += ABRE + (/^[\w.]+$/.test(interior) ? interior : '') + CIERRA;
      j = fin;
      continue;
    }
    salida += c;
    j++;
  }
  return salida;
}

function cortarConsulta(texto) {
  let dentro = false;
  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === ABRE) dentro = true;
    else if (texto[i] === CIERRA) dentro = false;
    else if (texto[i] === '?' && !dentro) return texto.slice(0, i);
  }
  return texto;
}

const SOLO_EXPRESION = new RegExp(`^${ABRE}[^${CIERRA}]*${CIERRA}$`);
const LITERAL_Y_SUFIJO = new RegExp(`^([^${ABRE}]+)${ABRE}[^${CIERRA}]*${CIERRA}$`);

/** Patrón de API ('/a/*') a partir del contenido del literal; undefined = no es la API; null = no se puede saber. */
function patronDeRuta(contenido, funcion) {
  let t = contenido;
  if (funcion === 'fetch') {
    const m = t.match(new RegExp(`^${ABRE}(API_URL|API_ORIGIN)${CIERRA}`));
    if (!m) return undefined;
    t = t.slice(m[0].length);
    if (m[1] === 'API_ORIGIN') {
      if (!t.startsWith('/api/v1')) return undefined;
      t = t.slice('/api/v1'.length);
    }
  }
  if (t.startsWith('/api/v1/')) t = t.slice('/api/v1'.length);
  if (!t.startsWith('/')) return null;
  const tramos = cortarConsulta(t).split('/').filter(Boolean);
  const salida = tramos.map((s, i) => {
    if (!s.includes(ABRE)) return s;
    if (SOLO_EXPRESION.test(s)) return '*';
    const m = s.match(LITERAL_Y_SUFIJO);
    // 'excel${consulta}' al final: lo variable es la consulta, el tramo es 'excel'
    if (m && i === tramos.length - 1) return m[1];
    return '*';
  });
  return '/' + salida.join('/');
}

function metodosDe(funcion, opciones) {
  if (funcion === 'descargarArchivo' || !opciones) return ['GET'];
  if (!opciones.startsWith('{')) return [...METODOS];
  const m = opciones.match(/\bmethod\s*:\s*([^,}]+)/);
  if (!m) return ['GET'];
  const encontrados = [...m[1].matchAll(/['"`](GET|POST|PUT|PATCH|DELETE)['"`]/g)].map((x) => x[1]);
  return encontrados.length ? [...new Set(encontrados)].sort() : [...METODOS];
}

export function extraerLlamadas(fuente) {
  const porPatron = new Map();
  const sinResolver = [];
  const re = /\b(apiFetch|descargarArchivo|fetch)\s*\(/g;
  let m;
  while ((m = re.exec(fuente))) {
    const args = argumentosDesde(fuente, m.index + m[0].length);
    if (args === null) continue;
    const partes = dividirArgumentos(args);
    if (!partes.length) continue;
    const contenido = contenidoLiteral(partes[0]);
    if (contenido === null) {
      if (m[1] !== 'fetch') sinResolver.push(partes[0].slice(0, 120));
      continue;
    }
    const patron = patronDeRuta(contenido, m[1]);
    if (patron === undefined) continue;
    if (patron === null) { sinResolver.push(partes[0].slice(0, 120)); continue; }
    const metodos = porPatron.get(patron) ?? new Set();
    for (const x of metodosDe(m[1], partes[1])) metodos.add(x);
    porPatron.set(patron, metodos);
  }
  const llamadas = [...porPatron].map(([patron, metodos]) => ({ metodos: [...metodos].sort(), patron }));
  return { llamadas, sinResolver };
}

/** Especificadores de import locales (relativos o '@/'), sin los `import type`. */
export function importsLocales(fuente) {
  const salida = [];
  for (const m of fuente.matchAll(/^\s*import\s+(?!type\b)([^'";]*?)\s+from\s+['"]([^'"]+)['"]/gm)) salida.push(m[2]);
  for (const m of fuente.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) salida.push(m[1]);
  return salida.filter((s) => s.startsWith('.') || s.startsWith('@/'));
}

/** Los códigos asignados no cambian nunca; los nuevos siguen la numeración 0xB…. */
export function asignarCodigos(rutas, previos) {
  const codigos = { ...previos };
  const usados = new Set(Object.values(codigos));
  const numerosB = Object.values(codigos).filter((c) => /^0xB[0-9A-F]{3}$/.test(c)).map((c) => parseInt(c.slice(2), 16));
  let siguiente = Math.max(0xb000, ...numerosB) + 1;
  for (const ruta of [...new Set(rutas)].sort()) {
    if (codigos[ruta]) continue;
    let codigo;
    do {
      if (siguiente > 0xbfff) throw new Error('Se agotaron los códigos 0xB…');
      codigo = '0x' + siguiente.toString(16).toUpperCase().padStart(4, '0');
      siguiente++;
    } while (usados.has(codigo));
    codigos[ruta] = codigo;
    usados.add(codigo);
  }
  return Object.fromEntries(Object.entries(codigos).sort(([a], [b]) => a.localeCompare(b)));
}

/** slug -> prefijo de permisos, leido de src/lib/modulos.ts ('' => null). */
export function prefijosDeModulos(fuenteModulos) {
  const mapa = {};
  for (const m of fuenteModulos.matchAll(/slug:\s*'([^']+)'[^}]*?permisoPrefijo:\s*'([^']*)'/g)) mapa[m[1]] = m[2] || null;
  return mapa;
}
