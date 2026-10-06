import { PATRONES_FLOTA, filtroDeMensaje, responderFlota } from './flota-tool.util';

const ahora = new Date('2026-03-10T12:00:00');
const m = (numeroInterno: string, estadoOperativo: string, extra: Record<string, unknown> = {}) => ({
  numeroInterno, alias: null, estado: 'OPERATIVO', estadoOperativo, estadoOperativoDesde: new Date('2026-03-10T11:30:00'), ...extra,
});

describe('get_flota: reconocimiento', () => {
  const dispara = (frase: string) => PATRONES_FLOTA.some((p) => p.test(frase));

  it.each([
    'que moviles estan en servicio',
    'cuales moviles estan despachados',
    'moviles en el cuartel',
    'cuantos moviles salieron',
    'que vehiculos estan afuera',
    'moviles listos para salir',
    'donde estan los moviles',
    'moviles regresando',
  ])('reconoce: %s', (frase) => expect(dispara(frase)).toBe(true));

  it.each([
    'que moviles estan disponibles', // lo contesta get_vehiculos (estado administrativo)
    'moviles fuera de servicio',
    'cuantos vehiculos hay',
    'que movil es Murita',
    'quien esta de guardia',
  ])('NO pisa a las otras herramientas: %s', (frase) => expect(dispara(frase)).toBe(false));
});

describe('filtroDeMensaje', () => {
  it('traduce la pregunta al estado operativo', () => {
    expect(filtroDeMensaje('moviles regresando')).toBe('REGRESANDO');
    expect(filtroDeMensaje('moviles despachados')).toBe('DESPACHADO');
    expect(filtroDeMensaje('que moviles estan en servicio')).toBe('EN_SERVICIO');
    expect(filtroDeMensaje('cuantos moviles salieron')).toBe('FUERA_DEL_CUARTEL');
    expect(filtroDeMensaje('moviles listos para salir')).toBe('EN_CUARTEL');
    expect(filtroDeMensaje('donde estan los moviles')).toBeNull();
  });
});

describe('responderFlota', () => {
  const flota = [
    m('10', 'EN_CUARTEL'),
    m('20', 'EN_SERVICIO', { alias: 'Murita' }),
    m('30', 'REGRESANDO'),
    m('40', 'EN_CUARTEL', { estado: 'EN_MANTENIMIENTO' }),
    m('50', 'EN_CUARTEL', { estado: 'BAJA' }),
  ];

  it('sin filtro lista toda la flota (sin los de baja) con el estado de cada uno', () => {
    const r = responderFlota(flota, null, ahora);
    expect(r.contenidoRespuesta).toContain('4 moviles');
    expect(r.contenidoRespuesta).toContain('- 20 (Murita): en servicio, hace 30 min');
    expect(r.contenidoRespuesta).toContain('- 40: en el cuartel, hace 30 min (en mantenimiento)');
    expect(r.contenidoRespuesta).not.toContain('50');
  });

  it('filtra por estado y usa singular o plural', () => {
    expect(responderFlota(flota, 'EN_SERVICIO', ahora).contenidoRespuesta).toMatch(/^Hay 1 movil en servicio:\n- 20 \(Murita\)/);
    expect(responderFlota(flota, 'FUERA_DEL_CUARTEL', ahora).contenidoRespuesta).toMatch(/^Hay 2 moviles fuera del cuartel/);
  });

  it('avisa cuando un movil "en el cuartel" no esta operativo', () => {
    expect(responderFlota(flota, 'EN_CUARTEL', ahora).contenidoRespuesta).toContain('no estan operativos');
    expect(responderFlota([m('10', 'EN_CUARTEL')], 'EN_CUARTEL', ahora).contenidoRespuesta).not.toContain('Ojo');
  });

  it('responde claro cuando no hay ninguno o no hay moviles cargados', () => {
    expect(responderFlota([m('10', 'EN_CUARTEL')], 'DESPACHADO', ahora).contenidoRespuesta).toBe('No hay moviles despachado en este momento.');
    expect(responderFlota([], null, ahora).contenidoRespuesta).toContain('No tengo moviles');
    expect(responderFlota([m('50', 'EN_CUARTEL', { estado: 'BAJA' })], null, ahora).contenidoRespuesta).toContain('No tengo moviles');
  });

  it('el resumen de auditoria no incluye datos personales', () => {
    expect(responderFlota(flota, 'EN_SERVICIO', ahora).resumenAuditoria).toBe('Flota -> 1 en servicio');
  });
});
