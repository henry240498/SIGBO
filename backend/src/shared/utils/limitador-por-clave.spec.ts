import { LimitadorPorClave } from './limitador-por-clave';

describe('LimitadorPorClave', () => {
  const t0 = new Date('2026-10-10T10:00:00Z');
  const mas = (ms: number) => new Date(t0.getTime() + ms);

  it('la primera vez registra; dentro de la ventana no; pasada la ventana, sí', () => {
    const l = new LimitadorPorClave(10 * 60_000);
    expect(l.debeRegistrar('u1', t0)).toBe(true);
    l.marcar('u1', t0);
    expect(l.debeRegistrar('u1', mas(60_000))).toBe(false);
    expect(l.debeRegistrar('u1', mas(10 * 60_000))).toBe(true);
  });

  it('cada clave lleva su propia ventana', () => {
    const l = new LimitadorPorClave(60_000);
    l.marcar('a', t0);
    expect(l.debeRegistrar('a', mas(1000))).toBe(false);
    expect(l.debeRegistrar('b', mas(1000))).toBe(true);
  });

  it('si no se marca (la escritura falló), el siguiente intento vuelve a registrar', () => {
    const l = new LimitadorPorClave(60_000);
    expect(l.debeRegistrar('a', t0)).toBe(true);
    expect(l.debeRegistrar('a', mas(1000))).toBe(true);
  });

  it('acepta milisegundos además de fechas', () => {
    const l = new LimitadorPorClave(1000);
    l.marcar('a', 5000);
    expect(l.debeRegistrar('a', 5500)).toBe(false);
    expect(l.debeRegistrar('a', 6000)).toBe(true);
  });
});
