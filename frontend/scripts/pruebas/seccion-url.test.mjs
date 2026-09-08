/**
 * Pruebas de la resolucion de `?seccion=` del expediente.
 *
 * Usa el runner nativo de Node, sin dependencias: el frontend no tiene framework de
 * pruebas y agregar uno para esto seria desproporcionado.
 *
 * Correr: npm run test:seccion   (o: node --test scripts/pruebas/)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { seccionPedida, urlConSeccion } from '../../src/lib/seccion-url.ts';

const IDS = ['resumen', 'personales', 'salud', 'foja', 'auditoria'];

test('sin parametro devuelve null y el llamador conserva su valor por defecto', () => {
  assert.equal(seccionPedida('', IDS), null);
  assert.equal(seccionPedida('?otra=cosa', IDS), null);
});

test('un id valido se devuelve tal cual', () => {
  assert.equal(seccionPedida('?seccion=salud', IDS), 'salud');
  assert.equal(seccionPedida('?seccion=resumen', IDS), 'resumen');
});

test('un id inventado no se acepta: dejaria el panel en blanco', () => {
  assert.equal(seccionPedida('?seccion=inexistente', IDS), null);
  assert.equal(seccionPedida('?seccion=', IDS), null);
});

test('distingue mayusculas: los ids del sistema son minusculas', () => {
  assert.equal(seccionPedida('?seccion=SALUD', IDS), null);
});

test('convive con otros parametros y respeta el orden', () => {
  assert.equal(seccionPedida('?pagina=2&seccion=foja', IDS), 'foja');
  assert.equal(seccionPedida('?seccion=foja&seccion=salud', IDS), 'foja');
});

test('no se deja enganar por un valor con espacios o codificado', () => {
  assert.equal(seccionPedida('?seccion=%20salud', IDS), null);
  assert.equal(seccionPedida('?seccion=salud%20', IDS), null);
});

test('urlConSeccion agrega la seccion conservando el resto de la query', () => {
  assert.equal(
    urlConSeccion('https://x/dashboard/personal/abc?pagina=2', 'salud'),
    'https://x/dashboard/personal/abc?pagina=2&seccion=salud',
  );
});

test('urlConSeccion reemplaza la seccion previa en vez de duplicarla', () => {
  assert.equal(
    urlConSeccion('https://x/dashboard/personal/abc?seccion=resumen', 'foja'),
    'https://x/dashboard/personal/abc?seccion=foja',
  );
});

test('los ids reales del expediente se resuelven todos', () => {
  const reales = [
    'resumen', 'personales', 'institucional', 'tipo', 'rango-cargo', 'historial',
    'especialidades', 'condicion', 'formacion', 'actividad', 'idiomas', 'servicios',
    'equipamiento', 'vehiculos', 'salud', 'firma-digital', 'documentos', 'foja',
    'timeline', 'auditoria',
  ];
  assert.equal(reales.length, 20);
  for (const id of reales) {
    assert.equal(seccionPedida(`?seccion=${id}`, reales), id, `no resolvio ${id}`);
  }
});
