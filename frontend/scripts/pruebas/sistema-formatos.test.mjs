import test from 'node:test';
import assert from 'node:assert/strict';
import { duracion, tamanio } from '../../src/app/dashboard/sistema/tipos.ts';

test('duración legible', () => {
  assert.equal(duracion(59), '0 min');
  assert.equal(duracion(3_660), '1 h 1 min');
  assert.equal(duracion(90_000), '1 d 1 h');
});

test('tamaño legible', () => {
  assert.equal(tamanio(500), '1 KB');
  assert.equal(tamanio(18_862_080), '18.0 MB');
});

test('bordes de duración y tamaño', () => {
  assert.equal(duracion(0), '0 min');
  for (const x of [-1, NaN, Infinity]) { assert.equal(duracion(x), '—'); assert.equal(tamanio(x), '—'); }
  assert.equal(tamanio(0), '0 B');
  assert.equal(tamanio(1_610_612_736), '1.5 GB');
  assert.equal(tamanio(1_073_741_823), '1024.0 MB');
});
