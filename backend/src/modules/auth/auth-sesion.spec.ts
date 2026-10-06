import { modoDeSesion, politicaSesion, vencimientoTrasRenovar } from './auth.service';

const DIA = 86_400_000;
const HORA = 3_600_000;

describe('política de sesión ("Mantener sesión iniciada")', () => {
  const guardado = { ...process.env };
  beforeEach(() => {
    process.env.REFRESH_TOKEN_EXPIRATION = '7d';
    delete process.env.SESION_MANTENIDA_DIAS;
    delete process.env.SESION_MANTENIDA_MAX_DIAS;
    delete process.env.SESION_CORTA_HORAS;
  });
  afterAll(() => {
    process.env = guardado;
  });

  it('sin elegir rige el comportamiento de siempre: el plazo configurado, fijo', () => {
    expect(politicaSesion(undefined)).toEqual({ modo: 'ESTANDAR', ms: 7 * DIA, deslizante: false, maximoMs: 7 * DIA });
  });

  it('mantener sesión: 30 días que se renuevan con el uso, con un tope de 90 desde el inicio', () => {
    expect(politicaSesion(true)).toEqual({ modo: 'MANTENIDA', ms: 30 * DIA, deslizante: true, maximoMs: 90 * DIA });
  });

  it('no mantener: una sesión corta de 12 horas que no se estira', () => {
    expect(politicaSesion(false)).toEqual({ modo: 'CORTA', ms: 12 * HORA, deslizante: false, maximoMs: 12 * HORA });
  });

  it('los plazos se configuran, pero acotados: una sesión no puede durar para siempre', () => {
    process.env.SESION_MANTENIDA_DIAS = '5000';
    process.env.SESION_MANTENIDA_MAX_DIAS = '9999';
    process.env.SESION_CORTA_HORAS = '300';
    expect(politicaSesion(true)).toMatchObject({ ms: 90 * DIA, maximoMs: 365 * DIA });
    expect(politicaSesion(false).ms).toBe(24 * HORA);
    process.env.SESION_MANTENIDA_DIAS = 'abc';
    expect(politicaSesion(true).ms).toBe(30 * DIA);
  });

  it('renovar estira el vencimiento de una sesión mantenida, pero nunca pasa el tope', () => {
    const p = politicaSesion(true);
    const inicio = new Date('2026-10-01T00:00:00Z');
    const vence = new Date(inicio.getTime() + 30 * DIA);
    const diaCinco = new Date(inicio.getTime() + 5 * DIA);
    expect(vencimientoTrasRenovar(p, inicio, vence, diaCinco)).toEqual(new Date(diaCinco.getTime() + 30 * DIA));
    const diaOchenta = new Date(inicio.getTime() + 80 * DIA);
    expect(vencimientoTrasRenovar(p, inicio, vence, diaOchenta)).toEqual(new Date(inicio.getTime() + 90 * DIA));
  });

  it('renovar no estira una sesión corta ni la estándar, y nunca acorta una sesión', () => {
    const inicio = new Date('2026-10-01T00:00:00Z');
    const vence = new Date(inicio.getTime() + 12 * HORA);
    const ahora = new Date(inicio.getTime() + 2 * HORA);
    expect(vencimientoTrasRenovar(politicaSesion(false), inicio, vence, ahora)).toEqual(vence);
    expect(vencimientoTrasRenovar(politicaSesion(undefined), inicio, vence, ahora)).toEqual(vence);
    // una sesion mantenida que ya vence mas lejos del tope no retrocede
    const lejos = new Date(inicio.getTime() + 89 * DIA);
    expect(vencimientoTrasRenovar(politicaSesion(true), inicio, lejos, new Date(inicio.getTime() + 89.5 * DIA)).getTime()).toBeGreaterThanOrEqual(lejos.getTime());
  });

  it('el modo se lee de los datos de la sesión; lo que no se entiende es el estándar', () => {
    expect(modoDeSesion('{"modo":"MANTENIDA"}')).toBe('MANTENIDA');
    expect(modoDeSesion('{"modo":"CORTA"}')).toBe('CORTA');
    expect(modoDeSesion('{"modo":"RARO"}')).toBe('ESTANDAR');
    expect(modoDeSesion(null)).toBe('ESTANDAR');
    expect(modoDeSesion('no es json')).toBe('ESTANDAR');
  });
});
