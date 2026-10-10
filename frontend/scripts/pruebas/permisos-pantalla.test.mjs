/**
 * Pruebas de cómo la web aplica la matriz de permisos por pantalla.
 * Correr: node --test scripts/pruebas/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decisionDeRuta, destinoDeModulo, esperarPermisos, filtrarMigas, indexarPorRuta, matrizDeRespuesta, moduloVisibleEnMenu, motivoSinAcceso, pantallaDeRuta, pantallasVisibles,
  pantallasVisiblesDelModulo, puede, tabsVisibles,
} from '../../src/lib/permisos-pantalla.ts';

const PANTALLAS = [
  { ruta: '/dashboard', nombre: 'Inicio', modulo: 'inicio', codigo: null, detalle: false },
  { ruta: '/dashboard/personal', nombre: 'Personal', modulo: 'personal', codigo: '0xB001', detalle: false },
  { ruta: '/dashboard/personal/control', nombre: 'Control', modulo: 'personal', codigo: '0xB002', detalle: false },
  { ruta: '/dashboard/personal/[id]', nombre: 'Legajo del bombero', modulo: 'personal', codigo: '0xB003', detalle: true },
  { ruta: '/dashboard/personal/nuevo', nombre: 'Nuevo bombero', modulo: 'personal', codigo: '0xB004', detalle: false },
];
const MODULOS = [{ slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true, grupo: 'personas', descripcion: '' }];
const permiso = (ruta, o = {}) => ({ codigo: 'x', ruta, ver: true, crear: true, editar: true, eliminar: true, ...o });

test('una URL de detalle con id real resuelve a la pantalla [id]', () => {
  assert.equal(pantallaDeRuta('/dashboard/personal/3f2a9c1e-0000-4000-8000-000000000000', PANTALLAS)?.ruta, '/dashboard/personal/[id]');
  assert.equal(pantallaDeRuta('/dashboard/personal/nuevo', PANTALLAS)?.ruta, '/dashboard/personal/nuevo');
  assert.equal(pantallaDeRuta('/dashboard/personal/', PANTALLAS)?.ruta, '/dashboard/personal');
});

test('la matriz decide en el detalle', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal/[id]', { ver: false })]);
  assert.equal(decisionDeRuta('/dashboard/personal/abc-123-def-456', PANTALLAS, matriz)?.ver, false);
});

test('sin datos de la matriz (no se pudieron cargar) no se bloquea nada: decide el backend', () => {
  assert.equal(decisionDeRuta('/dashboard/personal', PANTALLAS, null), null);
  assert.equal(puede('/dashboard/personal', PANTALLAS, null, 'eliminar'), true);
});

test('Inicio queda fuera de la matriz', () => {
  assert.equal(decisionDeRuta('/dashboard', PANTALLAS, indexarPorRuta([])), null);
});

test('puede() lee la acción de la pantalla actual', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal', { eliminar: false })]);
  assert.equal(puede('/dashboard/personal', PANTALLAS, matriz, 'eliminar'), false);
  assert.equal(puede('/dashboard/personal', PANTALLAS, matriz, 'crear'), true);
});

test('el módulo aparece en el menú si alguna de sus pantallas se puede ver', () => {
  const ninguna = indexarPorRuta(PANTALLAS.filter((p) => p.codigo).map((p) => permiso(p.ruta, { ver: false })));
  assert.equal(moduloVisibleEnMenu(MODULOS[0], ['personal:ver'], PANTALLAS, ninguna), false);
  const una = indexarPorRuta([permiso('/dashboard/personal/control')]);
  assert.equal(moduloVisibleEnMenu(MODULOS[0], [], PANTALLAS, una), true);
});

test('sin datos de la matriz, el menú sigue por prefijo como antes (no se vacía)', () => {
  assert.equal(moduloVisibleEnMenu(MODULOS[0], ['personal:ver'], PANTALLAS, null), true);
  assert.equal(moduloVisibleEnMenu(MODULOS[0], ['guardias:ver'], PANTALLAS, null), false);
});

test('pestañas: con matriz solo las visibles; sin datos, todas', () => {
  const TABS = [{ href: '/dashboard/personal', label: 'Listado' }, { href: '/dashboard/personal/control', label: 'Control' }];
  const matriz = indexarPorRuta([permiso('/dashboard/personal'), permiso('/dashboard/personal/control', { ver: false })]);
  assert.deepEqual(tabsVisibles(TABS, PANTALLAS, matriz).map((t) => t.label), ['Listado']);
  assert.equal(tabsVisibles(TABS, PANTALLAS, null).length, 2);
});

test('buscador y accesos: sin detalles, Inicio siempre, el resto según la matriz o el prefijo', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal'), permiso('/dashboard/personal/control', { ver: false }), permiso('/dashboard/personal/nuevo', { ver: false })]);
  assert.deepEqual(pantallasVisibles(PANTALLAS, [], matriz, MODULOS).map((p) => p.ruta), ['/dashboard', '/dashboard/personal']);
  assert.deepEqual(pantallasVisibles(PANTALLAS, ['personal:ver'], null, MODULOS).map((p) => p.ruta), ['/dashboard', '/dashboard/personal', '/dashboard/personal/control', '/dashboard/personal/nuevo']);
});

test('pantalla sin codigo de un modulo que no es Inicio/Mi perfil/Reportar sigue el prefijo del modulo', () => {
  const MODS = [...MODULOS, { slug: 'seguridad', nombre: 'Seguridad', icono: 'shield', permisoPrefijo: 'seguridad:', disponible: true, grupo: 'sistema', descripcion: '' }];
  const PANT = [
    ...PANTALLAS,
    { ruta: '/dashboard/seguridad/pantallas', nombre: 'Permisos por pantalla', modulo: 'seguridad', codigo: null, detalle: false },
  ];
  const rutas = (permisos, matriz) => pantallasVisibles(PANT, permisos, matriz, MODS).map((p) => p.ruta);
  for (const matriz of [indexarPorRuta([]), null]) {
    assert.equal(rutas([], matriz).includes('/dashboard/seguridad/pantallas'), false);
    assert.equal(rutas(['seguridad:ver_usuarios'], matriz).includes('/dashboard/seguridad/pantallas'), true);
    assert.equal(rutas([], matriz).includes('/dashboard'), true);
  }
});

test('mientras cargan los permisos, una pantalla de la matriz espera; Inicio y Mi perfil no', () => {
  assert.equal(esperarPermisos('cargando', '/dashboard/personal', PANTALLAS), true);
  assert.equal(esperarPermisos('cargando', '/dashboard/personal/3f2a9c1e-0000-4000-8000-000000000000', PANTALLAS), true);
  assert.equal(esperarPermisos('cargando', '/dashboard', PANTALLAS), false);
  assert.equal(esperarPermisos('listo', '/dashboard/personal', PANTALLAS), false);
  // si no se pudieron cargar, no se bloquea nada: decide el backend
  assert.equal(esperarPermisos('sin_datos', '/dashboard/personal', PANTALLAS), false);
});

test('"Sin acceso" dice la causa real: el rol o una regla', () => {
  assert.equal(motivoSinAcceso(permiso('/dashboard/personal', { ver: false, origenVer: 'ROL' })), 'Tu rol no incluye permiso para esta pantalla.');
  assert.equal(motivoSinAcceso(permiso('/dashboard/personal', { ver: false, origenVer: 'REGLA' })), 'Una regla de Seguridad › Permisos por pantalla te restringe esta pantalla.');
  assert.equal(motivoSinAcceso(permiso('/dashboard/personal', { ver: false })), 'No tenés permiso para abrir esta pantalla.');
});

test('el menú y el Inicio llevan a la primera pantalla visible del módulo si la portada está denegada', () => {
  const sinPortada = indexarPorRuta([permiso('/dashboard/personal', { ver: false }), permiso('/dashboard/personal/control'), permiso('/dashboard/personal/nuevo')]);
  assert.equal(destinoDeModulo('personal', PANTALLAS, [], sinPortada, MODULOS), '/dashboard/personal/control');
  const conPortada = indexarPorRuta([permiso('/dashboard/personal'), permiso('/dashboard/personal/control')]);
  assert.equal(destinoDeModulo('personal', PANTALLAS, [], conPortada, MODULOS), '/dashboard/personal');
  // sin datos de la matriz, o sin ninguna visible, la portada como siempre
  assert.equal(destinoDeModulo('personal', PANTALLAS, ['personal:ver'], null, MODULOS), '/dashboard/personal');
  assert.equal(destinoDeModulo('personal', PANTALLAS, [], indexarPorRuta([]), MODULOS), '/dashboard/personal');
});

test('"Sin acceso" ofrece las otras pantallas visibles del mismo módulo (sin las de detalle)', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal', { ver: false }), permiso('/dashboard/personal/control'), permiso('/dashboard/personal/[id]'), permiso('/dashboard/personal/nuevo', { ver: false })]);
  assert.deepEqual(pantallasVisiblesDelModulo('personal', PANTALLAS, [], matriz, MODULOS).map((p) => p.ruta), ['/dashboard/personal/control']);
});

test('migas de pan: un tramo cuya pantalla no se puede ver queda sin enlace; sin datos, todas', () => {
  const migas = [{ nombre: 'Inicio', href: '/dashboard' }, { nombre: 'Personal', href: '/dashboard/personal' }, { nombre: 'Control' }];
  const matriz = indexarPorRuta([permiso('/dashboard/personal', { ver: false }), permiso('/dashboard/personal/control')]);
  assert.deepEqual(filtrarMigas(migas, PANTALLAS, matriz), [{ nombre: 'Inicio', href: '/dashboard' }, { nombre: 'Personal' }, { nombre: 'Control' }]);
  assert.deepEqual(filtrarMigas(migas, PANTALLAS, null), migas);
});

test('con activa:false (el servidor no armó su índice) la web no oculta nada por la matriz', () => {
  const pantallas = [permiso('/dashboard/personal', { crear: false, editar: false, eliminar: false })];
  assert.equal(matrizDeRespuesta({ activa: false, pantallas }), null);
  assert.equal(matrizDeRespuesta(null), null);
  assert.equal(matrizDeRespuesta({ activa: true, pantallas }).get('/dashboard/personal').crear, false);
  assert.equal(puede('/dashboard/personal', PANTALLAS, matrizDeRespuesta({ activa: false, pantallas }), 'crear'), true);
});
