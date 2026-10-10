import test from 'node:test';
import assert from 'node:assert/strict';
import { agruparPantallas, filtrarGrupos } from '../../src/lib/pantallas-admin.ts';

const filas = [
  { codigo: '0xA001', nombre: 'Alertas (app)', descripcion: null, confidencialAplica: false, activa: true },
  { codigo: '0xB001', nombre: 'Personal', descripcion: 'personal · /dashboard/personal', confidencialAplica: false, activa: true },
  { codigo: '0xB002', nombre: 'Artículos', descripcion: 'deposito · /dashboard/deposito/articulos', confidencialAplica: false, activa: true },
  { codigo: '0xC003', nombre: 'Centro de mando › Emergencias en curso', descripcion: null, confidencialAplica: false, activa: true },
  { codigo: '0xB0FF', nombre: 'Vieja', descripcion: null, confidencialAplica: false, activa: false },
];
const catalogo = [
  { codigo: '0xB001', nombre: 'Personal', ruta: '/dashboard/personal', modulo: 'personal', tipo: 'WEB', rutasApi: [] },
  { codigo: '0xB002', nombre: 'Artículos', ruta: '/dashboard/deposito/articulos', modulo: 'deposito', tipo: 'WEB', rutasApi: [] },
  { codigo: '0xC003', nombre: 'Centro de mando › Emergencias en curso', ruta: '/dashboard/centro-mando', modulo: 'centro-mando', tipo: 'SECCION', rutasApi: [] },
];
const nombres = { personal: 'Personal', deposito: 'Depósito' };

test('agrupa por módulo, con la app móvil y el Centro de mando aparte, sin las inactivas', () => {
  const g = agruparPantallas(filas, catalogo, nombres);
  assert.deepEqual(g.map((x) => x.titulo), ['Centro de mando', 'Depósito', 'Personal', 'App móvil']);
  assert.equal(g.flatMap((x) => x.pantallas).some((p) => p.codigo === '0xB0FF'), false);
});

test('busca por nombre, ruta o código sin distinguir acentos', () => {
  const g = agruparPantallas(filas, catalogo, nombres);
  assert.deepEqual(filtrarGrupos(g, 'articulos').flatMap((x) => x.pantallas).map((p) => p.codigo), ['0xB002']);
  assert.deepEqual(filtrarGrupos(g, '/dashboard/personal').flatMap((x) => x.pantallas).map((p) => p.codigo), ['0xB001']);
  assert.deepEqual(filtrarGrupos(g, '0xa001').flatMap((x) => x.pantallas).map((p) => p.codigo), ['0xA001']);
  assert.equal(filtrarGrupos(g, '').length, 4);
});

test('una pantalla web ausente del catálogo va a "Sin catálogo", no a la app móvil', () => {
  const extra = [...filas, { codigo: '0xB777', nombre: 'Huérfana', descripcion: null, confidencialAplica: false, activa: true }];
  const g = agruparPantallas(extra, catalogo, nombres);
  assert.deepEqual(g.map((x) => x.titulo), ['Centro de mando', 'Depósito', 'Personal', 'Sin catálogo', 'App móvil']);
  assert.deepEqual(g.find((x) => x.titulo === 'Sin catálogo').pantallas.map((p) => [p.codigo, p.tipo, p.ruta]), [['0xB777', 'WEB', null]]);
  assert.deepEqual(g.find((x) => x.titulo === 'App móvil').pantallas.map((p) => p.codigo), ['0xA001']);
  const vacio = agruparPantallas(extra, [], nombres);
  assert.deepEqual(vacio.map((x) => x.titulo), ['Sin catálogo', 'App móvil']);
});
