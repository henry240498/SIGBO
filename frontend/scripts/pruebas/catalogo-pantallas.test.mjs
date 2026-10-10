/**
 * Pruebas del catálogo de pantallas que alimenta la matriz de permisos web.
 * Correr: node --test scripts/pruebas/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { asignarCodigos, extraerLlamadas, importsLocales, prefijosDeModulos } from '../lib/catalogo-pantallas.mjs';

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
