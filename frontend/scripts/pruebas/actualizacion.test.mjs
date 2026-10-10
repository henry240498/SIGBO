import test from 'node:test';
import assert from 'node:assert/strict';
import { conTope, ControlDeCargas, esFallaDeConexion, haceCuanto, MENSAJE_TOPE_INTENTO, siguienteEspera, textoDeFalla } from '../../src/lib/actualizacion.ts';

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

test('conTope resuelve con el valor si llega a tiempo', async () => {
  assert.equal(await conTope(Promise.resolve('ok'), 1_000, 'tope'), 'ok');
});

test('conTope rechaza con el mensaje cuando el pedido se cuelga', async () => {
  const colgado = new Promise(() => {});
  await assert.rejects(conTope(colgado, 20, 'El servidor no respondió en 30 s.'), /no respondió/);
});

test('conTope descarta sin error un resultado tardío', async () => {
  const tarde = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error('tarde')), 40));
  await assert.rejects(conTope(tarde, 10, 'tope'), /tope/);
  await new Promise((r) => setTimeout(r, 80));
});

test('conTope no deja temporizadores pendientes (el proceso termina sin esperar el tope)', async () => {
  assert.equal(await conTope(Promise.resolve(1), 60_000, 'tope'), 1);
});

test('una falla sin respuesta es "Sin conexión"; un 403 o 500 es "No se pudo actualizar"', () => {
  assert.equal(esFallaDeConexion(new TypeError('Failed to fetch')), true);
  assert.equal(esFallaDeConexion(new Error(MENSAJE_TOPE_INTENTO)), true);
  assert.equal(esFallaDeConexion(new Error('No tenés permiso para ver en «Registros».')), false);
  assert.equal(textoDeFalla(true), 'Sin conexión con el servidor');
  assert.equal(textoDeFalla(false), 'No se pudo actualizar');
});

test('nunca dos cargas en vuelo; un refrescar manual durante una carga deja UNA de seguimiento', () => {
  const c = new ControlDeCargas();
  assert.equal(c.pedir(false), true);
  // el reloj o la visibilidad durante la carga: se ignoran
  assert.equal(c.pedir(false), false);
  assert.equal(c.terminar(), false);
  assert.equal(c.pedir(false), true);
  // dos clics durante la carga: una sola de seguimiento
  assert.equal(c.pedir(true), false);
  assert.equal(c.pedir(true), false);
  assert.equal(c.terminar(), true);
  assert.equal(c.pedir(true), true);
  assert.equal(c.terminar(), false);
});

test('al desactivar, el seguimiento pendiente se olvida', () => {
  const c = new ControlDeCargas();
  c.pedir(false);
  c.pedir(true);
  c.olvidar();
  assert.equal(c.terminar(), false);
});
