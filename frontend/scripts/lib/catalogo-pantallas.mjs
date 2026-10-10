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
// administrar la matriz nunca queda bajo la matriz (su código 0xB068 sigue reservado).
export const FUERA_DE_LA_MATRIZ = new Set([
  '/dashboard/seguridad/pantallas',
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
  // `{ headers, method }`: el método viaja en una variable
  if (!m) return /\bmethod\s*[,}]|\bmethod\s*$/.test(opciones) ? [...METODOS] : ['GET'];
  const encontrados = [...m[1].matchAll(/['"`](GET|POST|PUT|PATCH|DELETE)['"`]/g)].map((x) => x[1]);
  return encontrados.length ? [...new Set(encontrados)].sort() : [...METODOS];
}

export function extraerLlamadas(fuente) {
  const porPatron = new Map();
  const sinResolver = [];
  const re = /\b(apiFetch|descargarArchivo|fetch)\s*\(/g;
  let m;
  while ((m = re.exec(fuente))) {
    // una declaración (`function descargarArchivo(ruta: string, …)`) no es una llamada
    if (/function\s*\*?\s*$/.test(fuente.slice(Math.max(0, m.index - 20), m.index))) continue;
    const args = argumentosDesde(fuente, m.index + m[0].length);
    if (args === null) continue;
    const partes = dividirArgumentos(args);
    if (!partes.length) continue;
    // primer argumento con forma de parámetro tipado (`ruta: string`): es una firma
    if (/^[\w$]+\??\s*:\s*[\w$[\]<>|'"]/.test(partes[0])) continue;
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
  return importsConNombres(fuente).map((i) => i.especificador);
}

const esLocal = (s) => s.startsWith('.') || s.startsWith('@/');

/**
 * Enlaces de una cláusula de import ('a, { b as c, type T }', '* as ns'):
 * [{ local, original }] con original = 'default' | '*' | el nombre exportado.
 */
function enlacesDeClausula(clausula) {
  const enlaces = [];
  let resto = clausula.trim();
  const llave = resto.indexOf('{');
  const nombradas = llave >= 0 ? resto.slice(llave + 1, resto.lastIndexOf('}')) : '';
  if (llave >= 0) resto = resto.slice(0, llave);
  for (const parte of resto.split(',').map((x) => x.trim()).filter(Boolean)) {
    const ns = parte.match(/^\*\s+as\s+([\w$]+)$/);
    if (ns) enlaces.push({ local: ns[1], original: '*' });
    else if (/^[\w$]+$/.test(parte)) enlaces.push({ local: parte, original: 'default' });
  }
  for (const parte of nombradas.split(',').map((x) => x.trim()).filter(Boolean)) {
    if (/^type\s/.test(parte)) continue; // `{ type T }` no existe en tiempo de ejecucion
    const m = parte.match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/);
    if (m) enlaces.push({ local: m[2] ?? m[1], original: m[1] });
  }
  return enlaces;
}

/**
 * Imports locales (relativos o '@/') con lo que nombra cada uno, sin los `import type`:
 * [{ especificador, enlaces: [{ local, original }] | null }]. enlaces = null es un import
 * solo por sus efectos (`import './x'`): cuenta el archivo completo.
 */
export function importsConNombres(fuente) {
  const salida = [];
  for (const m of fuente.matchAll(/^\s*import\s+(?!type\b)([^'";]*?)\s+from\s+['"]([^'"]+)['"]/gm)) {
    salida.push({ especificador: m[2], enlaces: enlacesDeClausula(m[1]) });
  }
  for (const m of fuente.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) salida.push({ especificador: m[1], enlaces: null });
  return salida.filter((i) => esLocal(i.especificador));
}

/** Reexportaciones (`export { a as b } from`, `export * from`): [{ especificador, nombres: [{ exportado, original }] | null }]. */
function reexportaciones(fuente) {
  const salida = [];
  for (const m of fuente.matchAll(/^\s*export\s+(?!type\b)(\*(?:\s+as\s+([\w$]+))?|\{([^}]*)\})\s*from\s+['"]([^'"]+)['"]/gm)) {
    if (!esLocal(m[4])) continue;
    if (m[1].startsWith('*')) {
      salida.push({ especificador: m[4], nombres: null, como: m[2] ?? null });
      continue;
    }
    const nombres = m[3].split(',').map((x) => x.trim()).filter((x) => x && !/^type\s/.test(x))
      .map((x) => x.match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/)).filter(Boolean)
      .map((x) => ({ exportado: x[2] ?? x[1], original: x[1] }));
    salida.push({ especificador: m[4], nombres, como: null });
  }
  return salida;
}

// ------------------------------------------------------------------ recorte por función

/** Caracteres despues de los cuales una `/` abre una expresion regular y no es una division. */
const ANTES_DE_REGEX = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);

/**
 * Inicio de cada linea que empieza fuera de toda llave, parentesis, cadena, plantilla o
 * comentario. Un lexer minimo: alcanza para cortar un archivo de src/lib en sus
 * declaraciones de nivel superior. Si se confunde, corta de menos (trozos mas grandes),
 * que es el lado seguro: se atribuye de mas, nunca de menos.
 */
function lineasDeNivelSuperior(fuente) {
  const inicios = [0];
  let profundidad = 0;
  let previo = '';
  let i = 0;
  while (i < fuente.length) {
    const c = fuente[i];
    if (c === '\n') {
      i++;
      if (profundidad === 0) inicios.push(i);
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '/' && fuente[i + 1] === '/') { while (i < fuente.length && fuente[i] !== '\n') i++; continue; }
    if (c === '/' && fuente[i + 1] === '*') { const fin = fuente.indexOf('*/', i + 2); i = fin < 0 ? fuente.length : fin + 2; continue; }
    if (c === '`') { i = saltarCadena(fuente, i); previo = 'x'; continue; }
    if (c === '\'' || c === '"') {
      // una comilla sin cerrar en la linea no se lleva el resto del archivo
      let j = i + 1;
      while (j < fuente.length && fuente[j] !== c && fuente[j] !== '\n') j += fuente[j] === '\\' ? 2 : 1;
      i = fuente[j] === c ? j + 1 : j;
      previo = 'x';
      continue;
    }
    if (c === '/' && (ANTES_DE_REGEX.has(previo) || /\b(return|typeof|case|in|of|void|delete|throw|new)$/.test(fuente.slice(Math.max(0, i - 8), i).trimEnd()))) {
      let j = i + 1;
      let clase = false;
      while (j < fuente.length && fuente[j] !== '\n') {
        if (fuente[j] === '\\') { j += 2; continue; }
        if (fuente[j] === '[') clase = true;
        else if (fuente[j] === ']') clase = false;
        else if (fuente[j] === '/' && !clase) break;
        j++;
      }
      i = j + 1;
      while (/[a-z]/i.test(fuente[i] ?? '')) i++;
      previo = 'x';
      continue;
    }
    if (c === '{' || c === '(' || c === '[') profundidad++;
    else if (c === '}' || c === ')' || c === ']') profundidad = Math.max(0, profundidad - 1);
    previo = /[\w$]/.test(c) ? 'x' : c;
    i++;
  }
  return inicios;
}

const DECLARACION = [
  [/^export\s+default\s+(?:async\s+)?function\s*\*?\s*([\w$]+)?/, (m) => ['default', ...(m[1] ? [m[1]] : [])]],
  [/^export\s+default\s+(?:abstract\s+)?class\s+([\w$]+)?/, (m) => ['default', ...(m[1] ? [m[1]] : [])]],
  [/^export\s+default\b/, () => ['default']],
  [/^(?:export\s+)?(?:declare\s+)?(?:async\s+)?function\s*\*?\s*([\w$]+)/, (m) => [m[1]]],
  [/^(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?class\s+([\w$]+)/, (m) => [m[1]]],
  [/^(?:export\s+)?(?:declare\s+)?(?:interface|type|enum|namespace|module)\s+([\w$]+)/, (m) => [m[1]]],
  [/^(?:export\s+)?(?:declare\s+)?(?:const|let|var)\s+([\w$]+)/, (m) => [m[1]]],
  // `const { a, b: c } = …` o `const [a, b] = …`
  [/^(?:export\s+)?(?:declare\s+)?(?:const|let|var)\s+([{[][^=]*)=/, (m) => [...m[1].matchAll(/(?:^|[,{[\s:])([\w$]+)(?=\s*(?:[,}\]=]|$))/g)].map((x) => x[1])],
];

/**
 * El archivo partido en sus sentencias de nivel superior: [{ tipo, nombres, texto }].
 * tipo: 'import' | 'reexport' | 'lista' (export { a as b }) | 'declaracion' | 'suelto'.
 */
export function trozosDeNivelSuperior(fuente) {
  const cortes = lineasDeNivelSuperior(fuente).filter((i) => /^[A-Za-z_$@]/.test(fuente[i] ?? ''));
  if (!cortes.length || cortes[0] !== 0) cortes.unshift(0);
  const trozos = [];
  for (let k = 0; k < cortes.length; k++) {
    const texto = fuente.slice(cortes[k], cortes[k + 1] ?? fuente.length);
    const inicio = texto.trimStart();
    if (/^import\b/.test(inicio)) { trozos.push({ tipo: 'import', nombres: [], texto }); continue; }
    if (/^export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s*from\b/.test(inicio)) { trozos.push({ tipo: 'reexport', nombres: [], texto }); continue; }
    const lista = inicio.match(/^export\s+\{([^}]*)\}/);
    if (lista) {
      const alias = lista[1].split(',').map((x) => x.trim()).filter(Boolean).map((x) => x.match(/^(?:type\s+)?([\w$]+)(?:\s+as\s+([\w$]+))?$/)).filter(Boolean)
        .map((x) => ({ exportado: x[2] ?? x[1], local: x[1] }));
      trozos.push({ tipo: 'lista', nombres: [], alias, texto });
      continue;
    }
    let nombres = null;
    for (const [re, a] of DECLARACION) {
      const m = inicio.match(re);
      if (m) { nombres = a(m); break; }
    }
    trozos.push(nombres ? { tipo: 'declaracion', nombres, texto } : { tipo: 'suelto', nombres: [], texto });
  }
  return trozos;
}

const identificadores = (texto) => new Set(texto.match(/[A-Za-z_$][\w$]*/g) ?? []);

function agregarDependencia(mapa, especificador, nombres) {
  // `import { type A }` o un import solo de tipos: no existe en tiempo de ejecucion
  if (nombres !== null && nombres.length === 0) return;
  if (!mapa.has(especificador)) mapa.set(especificador, nombres === null ? null : new Set());
  const actual = mapa.get(especificador);
  if (actual === null) return;
  if (nombres === null) mapa.set(especificador, null);
  else nombres.forEach((n) => actual.add(n));
}

/**
 * La parte de un módulo que hace falta para los nombres pedidos (nombres = null: el
 * archivo completo). Toma las declaraciones de esos nombres, las del mismo archivo que
 * esas referencian (cierre transitivo) y el código suelto de nivel superior (corre al
 * importar). Devuelve { texto, incluidos, dependencias }: dependencias son los imports que
 * ese código usa, con los nombres que usa de cada uno (null = archivo completo: default,
 * `* as`, o solo efectos).
 */
export function recortarModulo(fuente, nombres) {
  const dependencias = new Map();
  const reexp = reexportaciones(fuente);
  if (nombres === null) {
    for (const imp of importsConNombres(fuente)) {
      agregarDependencia(dependencias, imp.especificador, imp.enlaces === null || imp.enlaces.some((e) => e.original === 'default' || e.original === '*') ? null : imp.enlaces.map((e) => e.original));
    }
    for (const r of reexp) agregarDependencia(dependencias, r.especificador, r.nombres === null ? null : r.nombres.map((n) => n.original));
    const incluidos = new Set(trozosDeNivelSuperior(fuente).flatMap((t) => t.nombres));
    return { texto: fuente, incluidos, dependencias: [...dependencias].map(([especificador, n]) => ({ especificador, nombres: n === null ? null : [...n] })) };
  }

  const trozos = trozosDeNivelSuperior(fuente);
  const porNombre = new Map();
  trozos.forEach((t, i) => t.nombres.forEach((n) => porNombre.set(n, [...(porNombre.get(n) ?? []), i])));
  const alias = new Map(trozos.filter((t) => t.tipo === 'lista').flatMap((t) => t.alias.map((a) => [a.exportado, a.local])));
  const usados = new Set();
  const incluidos = new Set();
  const pendientes = [...nombres];
  const usar = (i) => {
    if (usados.has(i)) return;
    usados.add(i);
    for (const id of identificadores(trozos[i].texto)) if (porNombre.has(id)) pendientes.push(id);
  };
  trozos.forEach((t, i) => { if (t.tipo === 'suelto') usar(i); });
  while (pendientes.length) {
    const n = pendientes.pop();
    if (incluidos.has(n)) continue;
    incluidos.add(n);
    const local = alias.get(n);
    if (local && local !== n) pendientes.push(local);
    const propios = porNombre.get(n) ?? [];
    propios.forEach(usar);
    if (propios.length || local) continue;
    // no se declara aca: puede venir de una reexportacion
    for (const r of reexp) {
      if (r.nombres === null && (r.como === null || r.como === n)) agregarDependencia(dependencias, r.especificador, r.como === n ? null : [n]);
      else if (r.nombres) for (const x of r.nombres.filter((y) => y.exportado === n)) agregarDependencia(dependencias, r.especificador, [x.original]);
    }
  }
  const elegidos = trozos.filter((_, i) => usados.has(i));
  const texto = elegidos.map((t) => t.texto).join('\n');
  const usadosEnTexto = identificadores(texto);
  for (const imp of importsConNombres(fuente)) {
    if (imp.enlaces === null) { agregarDependencia(dependencias, imp.especificador, null); continue; }
    for (const e of imp.enlaces.filter((x) => usadosEnTexto.has(x.local))) {
      agregarDependencia(dependencias, imp.especificador, e.original === 'default' || e.original === '*' ? null : [e.original]);
    }
  }
  return {
    texto,
    incluidos: new Set(elegidos.flatMap((t) => t.nombres)),
    dependencias: [...dependencias].map(([especificador, n]) => ({ especificador, nombres: n === null ? null : [...n] })),
  };
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
