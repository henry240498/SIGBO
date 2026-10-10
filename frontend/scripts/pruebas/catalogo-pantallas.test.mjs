/**
 * Pruebas del catálogo de pantallas que alimenta la matriz de permisos web.
 * Correr: node --test scripts/pruebas/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FUERA_DE_LA_MATRIZ, asignarCodigos, extraerLlamadas, importsConNombres, importsLocales, prefijosDeModulos, recortarModulo, trozosDeNivelSuperior,
} from '../lib/catalogo-pantallas.mjs';

const una = (fuente) => extraerLlamadas(fuente).llamadas;

test('literal simple es GET', () => {
  assert.deepEqual(una("apiFetch('/personal/bomberos')"), [{ metodos: ['GET'], patron: '/personal/bomberos' }]);
});

test('un ${…} entero es un segmento variable y se lee el método', () => {
  assert.deepEqual(una("apiFetch(`/personal/bomberos/${id}`, { method: 'DELETE' })"), [{ metodos: ['DELETE'], patron: '/personal/bomberos/*' }]);
  assert.deepEqual(una('apiFetch(`/a/${b}/c`)'), [{ metodos: ['GET'], patron: '/a/*/c' }]);
});

test('la consulta no cuenta, aunque venga dentro de una expresión', () => {
  assert.deepEqual(una('apiFetch(`/despacho/solicitudes?abiertas=${x}`)'), [{ metodos: ['GET'], patron: '/despacho/solicitudes' }]);
  assert.deepEqual(una("apiFetch(`/flota/vencimientos${q ? `?dias=${q}` : ''}`)"), [{ metodos: ['GET'], patron: '/flota/vencimientos' }]);
});

test('descargarArchivo con o sin /api/v1', () => {
  assert.deepEqual(una("descargarArchivo(`/personal/bomberos/exportar/excel${f ? `?estado=${f}` : ''}`, 'p.xlsx')"), [{ metodos: ['GET'], patron: '/personal/bomberos/exportar/excel' }]);
  assert.deepEqual(una("descargarArchivo('/api/v1/flota/informe/x/pdf', 'i.pdf')"), [{ metodos: ['GET'], patron: '/flota/informe/x/pdf' }]);
});

test('fetch solo cuenta si va a la API', () => {
  assert.deepEqual(una("fetch(`${API_URL}/auth/login`, { method: 'POST', body })"), [{ metodos: ['POST'], patron: '/auth/login' }]);
  assert.deepEqual(una("fetch('https://tile.openstreetmap.org/1/2/3.png')"), []);
});

test('método condicional o en una variable', () => {
  assert.deepEqual(una("apiFetch('/x', { method: editando ? 'PUT' : 'POST', body })"), [{ metodos: ['POST', 'PUT'], patron: '/x' }]);
  assert.deepEqual(una("apiFetch('/x', opciones)"), [{ metodos: ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'], patron: '/x' }]);
});

test('método abreviado { headers, method } es una variable', () => {
  assert.deepEqual(una("apiFetch('/x', { headers: h, method })"), [{ metodos: ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'], patron: '/x' }]);
  assert.deepEqual(una("apiFetch('/x', { headers: h, body })"), [{ metodos: ['GET'], patron: '/x' }]);
});

test('una declaración de función no es una llamada ni queda sin resolver', () => {
  const r = extraerLlamadas('export function descargarArchivo(ruta: string, nombre: string) {} export async function f(ruta: string) {}');
  assert.deepEqual(r.llamadas, []);
  assert.deepEqual(r.sinResolver, []);
});

test('una ruta en una variable se informa como no resuelta', () => {
  const r = extraerLlamadas('apiFetch(url)');
  assert.deepEqual(r.llamadas, []);
  assert.deepEqual(r.sinResolver, ['url']);
});

test('el mismo patrón llamado dos veces se une', () => {
  assert.deepEqual(una("apiFetch('/x'); apiFetch('/x', { method: 'POST' })"), [{ metodos: ['GET', 'POST'], patron: '/x' }]);
});

test('los códigos ya asignados no cambian y los nuevos siguen la numeración', () => {
  const previos = { '/dashboard/centro-mando': '0xC001', '/dashboard/b': '0xB002' };
  const r = asignarCodigos(['/dashboard/c', '/dashboard/b', '/dashboard/a', '/dashboard/centro-mando'], previos);
  assert.equal(r['/dashboard/b'], '0xB002');
  assert.equal(r['/dashboard/centro-mando'], '0xC001');
  assert.equal(r['/dashboard/a'], '0xB003');
  assert.equal(r['/dashboard/c'], '0xB004');
  // una ruta que desaparecio conserva su codigo (las reglas lo referencian)
  assert.equal(asignarCodigos([], r)['/dashboard/a'], '0xB003');
});

test('prefijos de permisos por módulo', () => {
  const fuente = "{ slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true }\n{ slug: 'centro-mando', nombre: 'Centro de mando', icono: 'flame', permisoPrefijo: '', disponible: true }";
  assert.deepEqual(prefijosDeModulos(fuente), { personal: 'personal:', 'centro-mando': null });
});

test('imports locales, sin los de tipos ni los de paquetes', () => {
  const fuente = "import { a } from './a';\nimport type { T } from './t';\nimport {\n  b,\n  c,\n} from '@/lib/b';\nimport React from 'react';\nimport './estilos.css';";
  assert.deepEqual(importsLocales(fuente), ['./a', '@/lib/b', './estilos.css']);
});

test('administrar la matriz nunca queda bajo la matriz', () => {
  assert.ok(FUERA_DE_LA_MATRIZ.has('/dashboard/seguridad/pantallas'));
});

// ---------------------------------------------------------------- atribución por función (src/lib)

const LIB_PERSONAL = `import { apiFetch } from './api';
import { cargarParametros } from './parametros';
import * as todo from './otro';

/** Orden institucional. */
export async function cargarBomberos() {
  const res = await apiFetch('/personal/bomberos');
  return ordenar(await res.json());
}

function ordenar(lista: string[]) {
  return [...lista].sort((a, b) => (a < b ? -1 : 1));
}

async function mensajeError(res: Response) {
  return (await res.json()).message;
}

export async function eliminarFirma(id: string) {
  const res = await apiFetch(\`/personal/bomberos/\${id}/firma-digital\`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res));
}

export const cargarTipos = () => cargarParametros('TIPO');

export function usarTodo() {
  return todo.x();
}
`;

const patrones = (texto) => extraerLlamadas(texto).llamadas.map((l) => `${l.metodos.join('|')} ${l.patron}`);

test('import con nombre de src/lib: solo las llamadas de esa función', () => {
  const r = recortarModulo(LIB_PERSONAL, ['cargarBomberos']);
  assert.deepEqual(patrones(r.texto), ['GET /personal/bomberos']);
  assert.ok(r.incluidos.has('cargarBomberos'));
});

test('un helper interno que la función referencia se incluye (cierre transitivo)', () => {
  const r = recortarModulo(LIB_PERSONAL, ['cargarBomberos']);
  assert.ok(r.incluidos.has('ordenar'));
  const firma = recortarModulo(LIB_PERSONAL, ['eliminarFirma']);
  assert.ok(firma.incluidos.has('mensajeError'));
  assert.deepEqual(patrones(firma.texto), ['DELETE /personal/bomberos/*/firma-digital']);
});

test('una función que no se importa no se atribuye', () => {
  const r = recortarModulo(LIB_PERSONAL, ['cargarBomberos']);
  assert.equal(r.incluidos.has('eliminarFirma'), false);
  assert.equal(patrones(r.texto).some((p) => p.includes('firma-digital')), false);
  // y sus imports tampoco se siguen
  assert.deepEqual(r.dependencias.map((d) => d.especificador), ['./api']);
});

test('los imports que usa la parte recortada se siguen con sus nombres', () => {
  const r = recortarModulo(LIB_PERSONAL, ['cargarTipos']);
  assert.deepEqual(r.dependencias, [{ especificador: './parametros', nombres: ['cargarParametros'] }]);
  const ns = recortarModulo(LIB_PERSONAL, ['usarTodo']);
  assert.deepEqual(ns.dependencias, [{ especificador: './otro', nombres: null }]);
});

test('archivo completo (import * o default): todas las llamadas y todos los imports', () => {
  const r = recortarModulo(LIB_PERSONAL, null);
  assert.deepEqual(patrones(r.texto).sort(), ['DELETE /personal/bomberos/*/firma-digital', 'GET /personal/bomberos']);
  assert.deepEqual(r.dependencias.map((d) => [d.especificador, d.nombres]), [['./api', ['apiFetch']], ['./parametros', ['cargarParametros']], ['./otro', null]]);
  assert.ok(r.incluidos.has('eliminarFirma'));
});

test('imports con nombre, alias, default, namespace y solo de tipos', () => {
  const fuente = "import Def, { a, b as c, type T } from '@/lib/x';\nimport * as ns from './y';\nimport { type Solo } from './z';\nimport './efectos';\nimport type { U } from './u';";
  assert.deepEqual(importsConNombres(fuente), [
    { especificador: '@/lib/x', enlaces: [{ local: 'Def', original: 'default' }, { local: 'a', original: 'a' }, { local: 'c', original: 'b' }] },
    { especificador: './y', enlaces: [{ local: 'ns', original: '*' }] },
    { especificador: './z', enlaces: [] },
    { especificador: './efectos', enlaces: null },
  ]);
  // un componente que importa default o namespace sigue el archivo completo; con nombre, solo esos
  const r = recortarModulo(fuente, null);
  assert.deepEqual(r.dependencias, [
    { especificador: '@/lib/x', nombres: null }, { especificador: './y', nombres: null }, { especificador: './efectos', nombres: null },
  ]);
});

test('el corte por declaraciones no se confunde con llaves en cadenas, plantillas, comentarios ni expresiones regulares', () => {
  const fuente = [
    "export const A = '{';",
    'export const B = `',
    'const falso = 1;',
    '`;',
    '/* { */',
    "export function C() { return /[{]/.test('}') ? apiFetch('/c') : null; }",
    "export function D() { return apiFetch('/d'); }",
  ].join('\n');
  assert.deepEqual(trozosDeNivelSuperior(fuente).map((t) => t.nombres.join(',')), ['A', 'B', 'C', 'D']);
  assert.deepEqual(patrones(recortarModulo(fuente, ['D']).texto), ['GET /d']);
});

test('una lista export { a as b } y el código suelto de nivel superior', () => {
  const fuente = "const INTERNO = () => apiFetch('/interno');\nexport { INTERNO as publico };\nregistrar(() => apiFetch('/al-importar'));\nexport function otra() { return apiFetch('/otra'); }\n";
  assert.deepEqual(patrones(recortarModulo(fuente, ['publico']).texto).sort(), ['GET /al-importar', 'GET /interno']);
});
