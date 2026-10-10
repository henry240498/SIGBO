import test from 'node:test';
import assert from 'node:assert/strict';
import { haceCuanto, siguienteEspera } from '../../src/lib/actualizacion.ts';

test('sin fallos espera el intervalo; con fallos duplica hasta 60 s', () => {
  assert.equal(siguienteEspera(10_000, 0), 10_000);
  assert.equal(siguienteEspera(10_000, 1), 20_000);
  assert.equal(siguienteEspera(10_000, 2), 40_000);
  assert.equal(siguienteEspera(10_000, 3), 60_000);
  assert.equal(siguienteEspera(10_000, 9), 60_000);
});

test('hace cuánto, en palabras', () => {
  const ahora = new Date('2026-10-09T12:00:00Z');
  assert.equal(haceCuanto(null, ahora), 'nunca');
  assert.equal(haceCuanto(new Date('2026-10-09T11:59:58Z'), ahora), 'recién');
  assert.equal(haceCuanto(new Date('2026-10-09T11:59:30Z'), ahora), 'hace 30 s');
  assert.equal(haceCuanto(new Date('2026-10-09T11:55:00Z'), ahora), 'hace 5 min');
  assert.equal(haceCuanto(new Date('2026-10-09T09:00:00Z'), ahora), 'hace 3 h');
});
