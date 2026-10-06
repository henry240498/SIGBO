import { DataSource } from 'typeorm';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { RADIO_GEOCERCA_POR_DEFECTO_M, movilFueraDelCuartel, radioGeocerca } from '../flota/geocerca.util';
import { AvisosVencimientoService, claveDeAviso, redactarAviso, umbralDe } from './avisos-vencimiento.service';
import { Vencimiento } from './vencimientos.service';

const v = (extra: Partial<Vencimiento> = {}): Vencimiento => ({
  origen: 'APTITUD', bomberoId: 'B1', bombero: 'Gomez, Ana', descripcion: 'Licencia de conducir', fecha: '2026-03-20', vencido: false, diasRestantes: 10, ...extra,
});

describe('umbrales y texto del aviso', () => {
  it('umbralDe: el primer umbral alcanzado', () => {
    expect([30, 20, 15, 14, 8, 7, 5, 3, 2, 1, 0].map(umbralDe)).toEqual([30, 30, 15, 15, 15, 7, 7, 3, 3, 3, 0]);
    expect(umbralDe(-1)).toBe(-1);
    expect(umbralDe(-100)).toBe(-1);
  });

  it('la clave cambia con el umbral y con la fecha de vencimiento (una renovacion avisa de nuevo)', () => {
    expect(claveDeAviso(v(), 15)).not.toBe(claveDeAviso(v(), 7));
    expect(claveDeAviso(v(), 15)).not.toBe(claveDeAviso(v({ fecha: '2027-03-20' }), 15));
    expect(claveDeAviso(v({ descripcion: 'x'.repeat(300) }), 15).length).toBeLessThanOrEqual(200);
  });

  it('redacta ordenado por urgencia y limita la cantidad de lineas', () => {
    const t = redactarAviso([v({ diasRestantes: 10 }), v({ bombero: 'Paz, Luis', diasRestantes: -3, vencido: true }), v({ bombero: 'Rios, Eva', diasRestantes: 0 })]);
    const lineas = t.split('\n');
    expect(lineas[0]).toBe('VENCIMIENTOS DEL PERSONAL');
    expect(lineas[1]).toContain('VENCIO hace 3 d');
    expect(lineas[2]).toContain('VENCE HOY');
    expect(lineas[3]).toContain('vence en 10 d');
    const muchos = redactarAviso(Array.from({ length: 60 }, (_, i) => v({ bomberoId: `B${i}` })));
    expect(muchos).toContain('y 20 mas');
  });
});

describe('AvisosVencimientoService.ejecutar', () => {
  let base: BaseFalsa;
  let telegram: { habilitado: jest.Mock; enviar: jest.Mock };
  let venc: { vencimientos: jest.Mock };
  let servicio: AvisosVencimientoService;
  const ahora = new Date('2026-03-10T12:00:00');

  beforeEach(() => {
    base = new BaseFalsa();
    telegram = { habilitado: jest.fn().mockReturnValue(true), enviar: jest.fn().mockResolvedValue(true) };
    venc = { vencimientos: jest.fn().mockResolvedValue([v({ diasRestantes: 10 }), v({ bomberoId: 'B2', bombero: 'Paz, Luis', diasRestantes: 2, fecha: '2026-03-12' })]) };
    servicio = new AvisosVencimientoService(base as unknown as DataSource, venc as never, telegram as never);
  });

  it('sin Telegram configurado no hace nada ni consulta', async () => {
    telegram.habilitado.mockReturnValue(false);
    expect(await servicio.ejecutar(ahora)).toMatchObject({ enviados: 0 });
    expect(venc.vencimientos).not.toHaveBeenCalled();
  });

  it('nunca envia datos medicos por un canal externo', async () => {
    await servicio.ejecutar(ahora);
    expect(venc.vencimientos).toHaveBeenCalledWith(30, expect.objectContaining({ incluirMedicas: false }));
  });

  it('avisa una vez; la pasada siguiente no repite lo ya avisado', async () => {
    expect(await servicio.ejecutar(ahora)).toEqual({ enviados: 2 });
    expect(telegram.enviar).toHaveBeenCalledTimes(1);
    expect(await servicio.ejecutar(ahora)).toEqual({ enviados: 0 });
    expect(telegram.enviar).toHaveBeenCalledTimes(1);
  });

  it('al acercarse el vencimiento (cruza otro umbral) vuelve a avisar solo ese', async () => {
    await servicio.ejecutar(ahora);
    venc.vencimientos.mockResolvedValue([v({ diasRestantes: 5 }), v({ bomberoId: 'B2', bombero: 'Paz, Luis', diasRestantes: 2, fecha: '2026-03-12' })]);
    expect(await servicio.ejecutar(ahora)).toEqual({ enviados: 1 }); // el de 10 dias paso al umbral 7; el de 2 sigue en el 3
    expect(telegram.enviar.mock.calls[1][0]).toContain('Gomez, Ana');
    expect(telegram.enviar.mock.calls[1][0]).not.toContain('Paz, Luis');
  });

  it('si Telegram falla no anota nada y reintenta despues', async () => {
    telegram.enviar.mockResolvedValueOnce(false);
    expect(await servicio.ejecutar(ahora)).toMatchObject({ enviados: 0 });
    expect(base.tabla('AvisoVencimiento')).toHaveLength(0);
    expect(await servicio.ejecutar(ahora)).toEqual({ enviados: 2 });
  });

  it('sin vencimientos no envia nada', async () => {
    venc.vencimientos.mockResolvedValue([]);
    expect(await servicio.ejecutar(ahora)).toEqual({ enviados: 0 });
    expect(telegram.enviar).not.toHaveBeenCalled();
  });
});

describe('geocerca del cuartel', () => {
  const cuartel = { latitud: -25.3, longitud: -57.6 };
  const ahora = new Date('2026-03-10T12:00:00Z');
  const pos = (lat: number, lon: number, haceMin = 1) => ({ latitud: lat, longitud: lon, registradoEn: new Date(ahora.getTime() - haceMin * 60_000) });

  it('radio: valor valido del entorno o el de por defecto', () => {
    expect(radioGeocerca(undefined)).toBe(RADIO_GEOCERCA_POR_DEFECTO_M);
    expect(radioGeocerca('500')).toBe(500);
    expect(radioGeocerca('5')).toBe(RADIO_GEOCERCA_POR_DEFECTO_M);
    expect(radioGeocerca('abc')).toBe(RADIO_GEOCERCA_POR_DEFECTO_M);
  });

  it('avisa si figura en el cuartel pero el GPS lo ubica lejos', () => {
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_CUARTEL' }, pos(-25.31, -57.6), cuartel, ahora)).toMatchObject({ fuera: true });
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_CUARTEL' }, pos(-25.3005, -57.6), cuartel, ahora)).toMatchObject({ fuera: false });
  });

  it('no avisa si esta despachado, si no hay posicion, ni cuartel con coordenadas', () => {
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_SERVICIO' }, pos(-25.5, -57.6), cuartel, ahora).fuera).toBe(false);
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_CUARTEL' }, undefined, cuartel, ahora).fuera).toBe(false);
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_CUARTEL' }, pos(-25.5, -57.6), undefined, ahora).fuera).toBe(false);
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_CUARTEL' }, pos(-25.5, -57.6), { latitud: null, longitud: null }, ahora).fuera).toBe(false);
  });

  it('una posicion vieja no prueba nada', () => {
    expect(movilFueraDelCuartel({ estadoOperativo: 'EN_CUARTEL' }, pos(-25.5, -57.6, 60), cuartel, ahora).fuera).toBe(false);
  });
});
