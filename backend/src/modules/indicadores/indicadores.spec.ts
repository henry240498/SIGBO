import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Despacho, Servicio, TipoServicio, Vehiculo } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import {
  agruparEnGrilla,
  contarPor,
  estadistica,
  franjaHoraria,
  percentil,
  segundosEntre,
} from './estadistica.util';
import { IndicadoresService } from './indicadores.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('estadistica.util', () => {
  it('percentil por rango mas cercano', () => {
    const v = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentil(v, 50)).toBe(50);
    expect(percentil(v, 90)).toBe(90);
    expect(percentil(v, 100)).toBe(100);
    expect(percentil(v, 0)).toBe(10);
    expect(percentil([], 50)).toBeNull();
  });

  it('estadistica ignora valores invalidos y no depende del orden', () => {
    const e = estadistica([300, 60, NaN, -5, 120, Infinity]);
    expect(e).toEqual({ n: 3, promedio: 160, mediana: 120, p90: 300, maximo: 300 });
    expect(estadistica([])).toEqual({ n: 0, promedio: null, mediana: null, p90: null, maximo: null });
  });

  it('segundosEntre: null si falta un dato o el orden es invertido', () => {
    expect(segundosEntre(new Date('2026-01-01T10:00:00Z'), new Date('2026-01-01T10:05:30Z'))).toBe(330);
    expect(segundosEntre(null, new Date())).toBeNull();
    expect(segundosEntre(new Date('2026-01-01T10:05:00Z'), new Date('2026-01-01T10:00:00Z'))).toBeNull();
  });

  it('franja horaria segun la hora local', () => {
    expect(franjaHoraria(new Date('2026-03-10T00:30:00'))).toBe('00-06');
    expect(franjaHoraria(new Date('2026-03-10T05:59:00'))).toBe('00-06');
    expect(franjaHoraria(new Date('2026-03-10T06:00:00'))).toBe('06-12');
    expect(franjaHoraria(new Date('2026-03-10T17:00:00'))).toBe('12-18');
    expect(franjaHoraria(new Date('2026-03-10T23:59:00'))).toBe('18-24');
  });

  it('contarPor ordena de mayor a menor y desempata alfabeticamente', () => {
    expect(contarPor(['b', 'a', 'b', 'c', 'a', 'b'], (x) => x)).toEqual([
      { clave: 'b', cantidad: 3 },
      { clave: 'a', cantidad: 2 },
      { clave: 'c', cantidad: 1 },
    ]);
  });

  it('agruparEnGrilla junta puntos cercanos y separa los lejanos', () => {
    const cerca = [
      { lat: -25.3000, lon: -57.6003 },
      { lat: -25.3001, lon: -57.6002 }, // a ~15 m
      { lat: -25.3002, lon: -57.6001 },
    ];
    const lejos = { lat: -25.4, lon: -57.6 };
    const celdas = agruparEnGrilla([...cerca, lejos], 500);
    expect(celdas).toHaveLength(2);
    expect(celdas[0].cantidad).toBe(3);
    expect(celdas[1].cantidad).toBe(1);
    expect(agruparEnGrilla([], 500)).toEqual([]);
    expect(agruparEnGrilla([{ lat: NaN, lon: 1 }], 500)).toEqual([]);
  });

  it('el centro de la celda queda cerca del punto original', () => {
    const [c] = agruparEnGrilla([{ lat: -25.3, lon: -57.6 }], 500);
    expect(Math.abs(c.latitud - -25.3)).toBeLessThan(0.005);
    expect(Math.abs(c.longitud - -57.6)).toBeLessThan(0.006);
  });
});

describe('IndicadoresService', () => {
  let base: BaseFalsa;
  let servicio: IndicadoresService;

  beforeEach(async () => {
    base = new BaseFalsa();
    servicio = new IndicadoresService(base as unknown as DataSource);
    await sembrar(base, TipoServicio, { id: 'T1', nombre: 'Incendio' });
    await sembrar(base, TipoServicio, { id: 'T2', nombre: 'Rescate' });
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '10' });
    await sembrar(base, Vehiculo, { id: 'V2', numeroInterno: '20' });

    const aviso = (iso: string) => new Date(iso);
    await sembrar(base, Servicio, {
      id: 'S1', estado: 'FINALIZADO', tipoServicioId: 'T1', gravedad: 'GRAVE',
      fechaHoraAviso: aviso('2026-03-10T02:00:00'), fechaHoraSalida: aviso('2026-03-10T02:02:00'), fechaHoraLlegada: aviso('2026-03-10T02:10:00'),
      coordenadasLat: -25.3, coordenadasLon: -57.6,
    });
    await sembrar(base, Servicio, {
      id: 'S2', estado: 'FINALIZADO', tipoServicioId: 'T2', gravedad: null,
      fechaHoraAviso: aviso('2026-03-11T15:00:00'), fechaHoraSalida: aviso('2026-03-11T15:04:00'), fechaHoraLlegada: aviso('2026-03-11T15:20:00'),
      coordenadasLat: -25.3001, coordenadasLon: -57.6001,
    });
    await sembrar(base, Servicio, {
      id: 'S3', estado: 'CANCELADO', tipoServicioId: 'T1', gravedad: 'LEVE', // no cuenta
      fechaHoraAviso: aviso('2026-03-12T10:00:00'), fechaHoraSalida: null, fechaHoraLlegada: null, coordenadasLat: null, coordenadasLon: null,
    });
    await sembrar(base, Servicio, {
      id: 'S4', estado: 'REGISTRADO', tipoServicioId: 'T1', gravedad: 'LEVE', // sin despacho ni coordenadas
      fechaHoraAviso: aviso('2026-03-12T21:00:00'), fechaHoraSalida: null, fechaHoraLlegada: null, coordenadasLat: null, coordenadasLon: null,
    });
    await sembrar(base, Servicio, {
      id: 'S5', estado: 'FINALIZADO', tipoServicioId: 'T1', gravedad: 'LEVE', // fuera de rango
      fechaHoraAviso: aviso('2025-12-01T10:00:00'), fechaHoraSalida: null, fechaHoraLlegada: null, coordenadasLat: -25.3, coordenadasLon: -57.6,
    });

    await sembrar(base, Despacho, { servicioId: 'S1', vehiculoId: 'V1', estado: 'CERRADO', horaSalida: aviso('2026-03-10T02:02:00'), horaLlegada: aviso('2026-03-10T02:10:00') });
    await sembrar(base, Despacho, { servicioId: 'S2', vehiculoId: 'V1', estado: 'CERRADO', horaSalida: aviso('2026-03-11T15:04:00'), horaLlegada: aviso('2026-03-11T15:20:00') });
    await sembrar(base, Despacho, { servicioId: 'S2', vehiculoId: 'V2', estado: 'CANCELADO', horaSalida: aviso('2026-03-11T15:05:00'), horaLlegada: null });
  });

  it('cuenta servicios (sin cancelados ni fuera de rango) y los que no tuvieron despacho', async () => {
    const r = await servicio.operativos('2026-03-01', '2026-03-31');
    expect(r.totalServicios).toBe(3);
    expect(r.sinDespacho).toBe(1);
  });

  it('calcula tiempos de salida, respuesta y viaje', async () => {
    const r = await servicio.operativos('2026-03-01', '2026-03-31');
    expect(r.tiempoDeSalida).toMatchObject({ n: 2, promedio: 180, maximo: 240 }); // 120 s y 240 s
    expect(r.tiempoDeRespuesta).toMatchObject({ n: 2, promedio: 900, maximo: 1200 }); // 600 s y 1200 s
  });

  it('distribuye por tipo, gravedad, franja y dia, y por movil sin contar despachos cancelados', async () => {
    const r = await servicio.operativos('2026-03-01', '2026-03-31');
    expect(r.porTipo).toEqual([{ clave: 'Incendio', cantidad: 2 }, { clave: 'Rescate', cantidad: 1 }]);
    expect(r.porGravedad.map((x) => x.clave).sort()).toEqual(['GRAVE', 'LEVE', 'Sin gravedad']);
    expect(r.porFranja).toEqual([
      { clave: '00-06', cantidad: 1 },
      { clave: '06-12', cantidad: 0 },
      { clave: '12-18', cantidad: 1 },
      { clave: '18-24', cantidad: 1 },
    ]);
    expect(r.porDiaSemana).toHaveLength(7);
    expect(r.porMovil).toEqual([{ movil: '10', salidas: 2, viaje: expect.objectContaining({ n: 2 }) }]);
  });

  it('el mapa de calor agrupa solo servicios con ubicacion', async () => {
    const r = await servicio.calor('2026-03-01', '2026-03-31', 500);
    expect(r.serviciosEnElPeriodo).toBe(3);
    expect(r.serviciosConUbicacion).toBe(2);
    expect(r.celdas).toHaveLength(1);
    expect(r.celdas[0].cantidad).toBe(2);
  });

  it('valida el rango de fechas', async () => {
    await expect(servicio.operativos('2026-03-31', '2026-03-01')).rejects.toThrow(BadRequestException);
    await expect(servicio.operativos('nada', '2026-03-01')).rejects.toThrow(BadRequestException);
    await expect(servicio.calor('2020-01-01', '2026-03-01')).rejects.toThrow(/732/);
  });

  it('sin servicios devuelve ceros y listas vacias, no errores', async () => {
    const r = await servicio.operativos('2030-01-01', '2030-01-31');
    expect(r.totalServicios).toBe(0);
    expect(r.tiempoDeRespuesta).toEqual({ n: 0, promedio: null, mediana: null, p90: null, maximo: null });
    expect(r.porMovil).toEqual([]);
    expect((await servicio.calor('2030-01-01', '2030-01-31')).celdas).toEqual([]);
  });
});
