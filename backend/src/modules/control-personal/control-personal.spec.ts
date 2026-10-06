import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Aptitud,
  AsignacionGuardia,
  Bombero,
  Certificacion,
  Equipo,
  Guardia,
  PrestamoEquipo,
  PuntoFichaje,
  Usuario,
  VehiculoAutorizado,
} from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { ANTIRREBOTE_SEGUNDOS, FichajeService, proximoTipo } from './fichaje.service';
import { HorasServicioService } from './horas-servicio.service';
import { resumirHoras, tramoDeAsignacion } from './horas.util';
import { VencimientosService, diasHasta } from './vencimientos.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

const t = (iso: string) => new Date(iso); // hora local

describe('horas.util', () => {
  const guardia = { id: 'G1', fecha: '2026-03-10', horaInicio: '08:00:00', horaFin: '20:00:00' };

  it('usa el horario programado si no hay horas reales', () => {
    const tr = tramoDeAsignacion(guardia, { bomberoId: 'B1', horaEntrada: null, horaSalida: null });
    expect(tr.fin.getTime() - tr.inicio.getTime()).toBe(12 * 3_600_000);
  });

  it('usa las horas reales cuando estan las dos, y ignora un rango invertido', () => {
    const real = tramoDeAsignacion(guardia, { bomberoId: 'B1', horaEntrada: t('2026-03-10T09:00:00'), horaSalida: t('2026-03-10T15:00:00') });
    expect(real.fin.getTime() - real.inicio.getTime()).toBe(6 * 3_600_000);
    const roto = tramoDeAsignacion(guardia, { bomberoId: 'B1', horaEntrada: t('2026-03-10T15:00:00'), horaSalida: t('2026-03-10T09:00:00') });
    expect(roto.fin.getTime() - roto.inicio.getTime()).toBe(12 * 3_600_000);
  });

  it('un turno nocturno termina al dia siguiente', () => {
    const tr = tramoDeAsignacion({ ...guardia, horaInicio: '20:00:00', horaFin: '08:00:00' }, { bomberoId: 'B1', horaEntrada: null, horaSalida: null });
    expect(tr.fin.getTime() - tr.inicio.getTime()).toBe(12 * 3_600_000);
  });

  const tramo = (g: string, ini: string, fin: string) => ({ guardiaId: g, bomberoId: 'B1', inicio: t(ini), fin: t(fin) });
  const limites = { horasMaximasPeriodo: 40, periodoDias: 7, descansoMinimoHoras: 12 };

  it('sin limites solo devuelve totales', () => {
    const r = resumirHoras('B1', [tramo('a', '2026-03-10T08:00:00', '2026-03-10T20:00:00')], null);
    expect(r).toMatchObject({ guardias: 1, totalHoras: 12, maximoEnPeriodo: null, excedeLimite: null, violacionesDescanso: [] });
  });

  it('detecta descanso insuficiente entre guardias consecutivas', () => {
    const r = resumirHoras('B1', [tramo('a', '2026-03-10T08:00:00', '2026-03-10T20:00:00'), tramo('b', '2026-03-11T04:00:00', '2026-03-11T12:00:00')], limites);
    expect(r.violacionesDescanso).toEqual([{ guardiaAnteriorId: 'a', guardiaSiguienteId: 'b', descansoHoras: 8 }]);
  });

  it('un descanso justo en el minimo no es violacion', () => {
    const r = resumirHoras('B1', [tramo('a', '2026-03-10T08:00:00', '2026-03-10T20:00:00'), tramo('b', '2026-03-11T08:00:00', '2026-03-11T20:00:00')], limites);
    expect(r.violacionesDescanso).toEqual([]);
  });

  it('guardias solapadas cuentan como descanso negativo', () => {
    const r = resumirHoras('B1', [tramo('a', '2026-03-10T08:00:00', '2026-03-10T20:00:00'), tramo('b', '2026-03-10T18:00:00', '2026-03-11T02:00:00')], limites);
    expect(r.violacionesDescanso[0].descansoHoras).toBeLessThan(0);
  });

  it('detecta exceso de horas en la ventana del periodo y reporta el maximo', () => {
    const tramos = [1, 3, 5, 7].map((d, i) => tramo(`g${i}`, `2026-03-0${d}T08:00:00`, `2026-03-0${d}T20:00:00`)); // 4 x 12h = 48h en 7 dias
    const r = resumirHoras('B1', tramos, limites);
    expect(r.maximoEnPeriodo).toBe(48);
    expect(r.excedeLimite).toBe(true);
    // el mismo trabajo repartido en un periodo mas largo ya no excede
    expect(resumirHoras('B1', tramos, { ...limites, periodoDias: 3 }).excedeLimite).toBe(false);
  });

  it('el orden de entrada no importa', () => {
    const a = tramo('a', '2026-03-10T08:00:00', '2026-03-10T20:00:00');
    const b = tramo('b', '2026-03-11T04:00:00', '2026-03-11T12:00:00');
    expect(resumirHoras('B1', [b, a], limites)).toEqual(resumirHoras('B1', [a, b], limites));
  });
});

describe('HorasServicioService', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: HorasServicioService;
  const ctx = { usuarioId: 'u1' };

  beforeEach(async () => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new HorasServicioService(base as unknown as DataSource, auditoria as never);
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gomez' });
    await sembrar(base, Guardia, { id: 'G1', fecha: '2026-03-10', horaInicio: '08:00:00', horaFin: '20:00:00', estado: 'FINALIZADA' });
    await sembrar(base, Guardia, { id: 'G2', fecha: '2026-03-11', horaInicio: '04:00:00', horaFin: '16:00:00', estado: 'FINALIZADA' });
    await sembrar(base, Guardia, { id: 'G3', fecha: '2026-03-12', horaInicio: '08:00:00', horaFin: '20:00:00', estado: 'CANCELADA' });
    await sembrar(base, Guardia, { id: 'G4', fecha: '2026-05-01', horaInicio: '08:00:00', horaFin: '20:00:00', estado: 'FINALIZADA' }); // fuera de rango
    for (const g of ['G1', 'G2', 'G3', 'G4']) {
      await sembrar(base, AsignacionGuardia, { guardiaId: g, bomberoId: 'B1', estado: 'CONFIRMADO', horaEntrada: null, horaSalida: null });
    }
    await sembrar(base, AsignacionGuardia, { guardiaId: 'G1', bomberoId: 'B2', estado: 'AUSENTE', horaEntrada: null, horaSalida: null });
  });

  it('sin limites configurados devuelve horas pero no alertas', async () => {
    const r = await servicio.resumen('2026-03-01', '2026-03-31');
    expect(r.limites).toBeNull();
    expect(r.conAlertas).toBe(0);
    expect(r.bomberos).toHaveLength(1); // B2 estuvo ausente; G3 cancelada y G4 fuera de rango no cuentan
    expect(r.bomberos[0]).toMatchObject({ nombre: 'Gomez, Ana', guardias: 2, totalHoras: 24, excedeLimite: null });
  });

  it('con limites marca el descanso insuficiente', async () => {
    await servicio.fijarLimites({ horasMaximasPeriodo: 100, periodoDias: 7, descansoMinimoHoras: 12 }, ctx);
    const r = await servicio.resumen('2026-03-01', '2026-03-31');
    expect(r.conAlertas).toBe(1);
    expect(r.bomberos[0].violacionesDescanso).toEqual([{ guardiaAnteriorId: 'G1', guardiaSiguienteId: 'G2', descansoHoras: 8 }]);
  });

  it('fijar limites nuevos deja los anteriores inactivos, sin borrarlos, y audita', async () => {
    await servicio.fijarLimites({ horasMaximasPeriodo: 40, periodoDias: 7, descansoMinimoHoras: 12 }, ctx);
    await servicio.fijarLimites({ horasMaximasPeriodo: 48, periodoDias: 7, descansoMinimoHoras: 10 }, ctx);
    const filas = base.tabla('LimiteHorasServicio');
    expect(filas).toHaveLength(2);
    expect(filas.filter((f) => f.activo)).toHaveLength(1);
    expect((await servicio.limitesActivos())?.horasMaximasPeriodo).toBe(48);
    expect(auditoria.registrar).toHaveBeenCalledTimes(2);
  });

  it('valida el rango de fechas', async () => {
    await expect(servicio.resumen('2026-03-31', '2026-03-01')).rejects.toThrow(BadRequestException);
    await expect(servicio.resumen('nada', '2026-03-01')).rejects.toThrow(BadRequestException);
    await expect(servicio.resumen('2024-01-01', '2026-03-01')).rejects.toThrow(/366/);
  });

  it('puede filtrar por bombero', async () => {
    await sembrar(base, AsignacionGuardia, { guardiaId: 'G1', bomberoId: 'B9', estado: 'CONFIRMADO', horaEntrada: null, horaSalida: null });
    const r = await servicio.resumen('2026-03-01', '2026-03-31', 'B9');
    expect(r.bomberos.map((b) => b.bomberoId)).toEqual(['B9']);
  });
});

describe('VencimientosService', () => {
  let base: BaseFalsa;
  let servicio: VencimientosService;
  const ctx = { usuarioId: 'u1' };
  const hoy = new Date('2026-03-10T12:00:00');

  beforeEach(async () => {
    base = new BaseFalsa();
    servicio = new VencimientosService(base as unknown as DataSource, { registrar: jest.fn().mockResolvedValue(undefined) } as never);
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gomez' });
    await sembrar(base, Bombero, { id: 'B2', nombre: 'Luis', apellido: 'Paz' });
  });

  it('diasHasta cuenta dias enteros, negativos si ya paso', () => {
    expect(diasHasta('2026-03-15', '2026-03-10')).toBe(5);
    expect(diasHasta('2026-03-10', '2026-03-10')).toBe(0);
    expect(diasHasta('2026-03-01', '2026-03-10')).toBe(-9);
  });

  it('crea aptitudes validando bombero y fechas, y audita', async () => {
    await expect(servicio.crearAptitud({ bomberoId: 'NO', categoria: 'OTRA', tipo: 'Curso', venceEn: '2026-12-01' }, ctx)).rejects.toThrow(NotFoundException);
    await expect(
      servicio.crearAptitud({ bomberoId: 'B1', categoria: 'OTRA', tipo: 'Curso', venceEn: '2026-01-01', emitidoEn: '2026-06-01' }, ctx),
    ).rejects.toThrow(BadRequestException);
    const a = await servicio.crearAptitud({ bomberoId: 'B1', categoria: 'MEDICA', tipo: 'Carnet de salud', venceEn: '2026-03-20T00:00:00.000Z' }, ctx);
    expect(a).toMatchObject({ venceEn: '2026-03-20', activo: true, creadoPor: 'u1' });
  });

  it('consolida aptitudes, certificaciones, autorizaciones de conduccion y equipos prestados', async () => {
    await sembrar(base, Aptitud, { bomberoId: 'B1', categoria: 'OTRA', tipo: 'Licencia de conducir', venceEn: '2026-03-15', activo: true });
    await sembrar(base, Aptitud, { bomberoId: 'B1', categoria: 'OTRA', tipo: 'Lejana', venceEn: '2027-01-01', activo: true });
    await sembrar(base, Aptitud, { bomberoId: 'B1', categoria: 'OTRA', tipo: 'De baja', venceEn: '2026-03-12', activo: false });
    await sembrar(base, Certificacion, { bomberoId: 'B2', nombre: 'Rescate vehicular', estado: 'VIGENTE', fechaVencimiento: '2026-03-01' }); // vencida
    await sembrar(base, Certificacion, { bomberoId: 'B2', nombre: 'En curso', estado: 'EN_PROCESO', fechaVencimiento: '2026-03-11' }); // ignorada
    await sembrar(base, VehiculoAutorizado, { bomberoId: 'B2', categoria: 'Autobomba', vigencia: '2026-03-30' });
    await sembrar(base, Equipo, { id: 'E1', nombre: 'Casco F1', fechaVencimiento: '2026-03-25' });
    await sembrar(base, Equipo, { id: 'E2', nombre: 'Casco sin prestar', fechaVencimiento: '2026-03-20' });
    await sembrar(base, PrestamoEquipo, { equipoId: 'E1', bomberoId: 'B1', estado: 'PRESTADO' });

    const r = await servicio.vencimientos(30, { incluirMedicas: false, hoy });
    expect(r.map((x) => [x.origen, x.descripcion, x.vencido])).toEqual([
      ['CERTIFICACION', 'Rescate vehicular', true],
      ['APTITUD', 'Licencia de conducir', false],
      ['EQUIPO', 'Equipo Casco F1', false],
      ['AUTORIZACION_VEHICULO', 'Autorizacion de conduccion (Autobomba)', false],
    ]);
    expect(r[0]).toMatchObject({ bombero: 'Paz, Luis', diasRestantes: -9 });
    // un plazo mas corto deja afuera lo que vence despues
    expect((await servicio.vencimientos(7, { incluirMedicas: false, hoy })).map((x) => x.descripcion)).toEqual(['Rescate vehicular', 'Licencia de conducir']);
  });

  it('las aptitudes medicas solo se ven con permiso', async () => {
    await sembrar(base, Aptitud, { bomberoId: 'B1', categoria: 'MEDICA', tipo: 'Carnet de salud', venceEn: '2026-03-15', activo: true });
    expect(await servicio.vencimientos(30, { incluirMedicas: false, hoy })).toHaveLength(0);
    expect(await servicio.vencimientos(30, { incluirMedicas: true, hoy })).toHaveLength(1);
    expect(await servicio.listarAptitudes('B1', false)).toHaveLength(0);
    expect(await servicio.listarAptitudes('B1', true)).toHaveLength(1);
  });

  it('dar de baja una aptitud la saca de los vencimientos', async () => {
    const a = await servicio.crearAptitud({ bomberoId: 'B1', categoria: 'OTRA', tipo: 'Curso', venceEn: '2026-03-15' }, ctx);
    expect(await servicio.vencimientos(30, { incluirMedicas: true, hoy })).toHaveLength(1);
    await servicio.actualizarAptitud(a.id, { activo: false }, ctx);
    expect(await servicio.vencimientos(30, { incluirMedicas: true, hoy })).toHaveLength(0);
  });
});

describe('fichaje', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: FichajeService;
  const ctx = { usuarioId: 'admin' };

  beforeEach(async () => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new FichajeService(base as unknown as DataSource, auditoria as never);
    await sembrar(base, Usuario, { id: 'U1', username: 'ana', bomberoId: 'B1' });
  });

  it('proximoTipo alterna ENTRADA/SALIDA y no arrastra una entrada olvidada', () => {
    const ahora = new Date('2026-03-10T12:00:00');
    expect(proximoTipo(null, ahora)).toBe('ENTRADA');
    expect(proximoTipo({ tipo: 'SALIDA', registradoEn: new Date('2026-03-10T08:00:00') }, ahora)).toBe('ENTRADA');
    expect(proximoTipo({ tipo: 'ENTRADA', registradoEn: new Date('2026-03-10T08:00:00') }, ahora)).toBe('SALIDA');
    expect(proximoTipo({ tipo: 'ENTRADA', registradoEn: new Date('2026-03-08T08:00:00') }, ahora)).toBe('ENTRADA');
  });

  it('el token se entrega una vez y en la base solo queda su hash', async () => {
    const p = await servicio.crearPunto('Puerta principal', ctx);
    expect(p.token.length).toBeGreaterThanOrEqual(30);
    const guardado = base.tabla('PuntoFichaje')[0];
    expect(guardado.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(guardado)).not.toContain(p.token);
    expect(JSON.stringify(await servicio.listarPuntos())).not.toContain('tokenHash');
  });

  it('un QR invalido, dado de baja o regenerado ya no ficha', async () => {
    const p = await servicio.crearPunto('Puerta', ctx);
    await expect(servicio.escanear('x'.repeat(24), 'U1')).rejects.toThrow(ForbiddenException);
    const nuevo = await servicio.regenerarToken(p.id, ctx);
    await expect(servicio.escanear(p.token, 'U1')).rejects.toThrow(ForbiddenException); // el viejo murio
    await expect(servicio.escanear(nuevo.token, 'U1')).resolves.toMatchObject({ tipo: 'ENTRADA' });
    await servicio.actualizarPunto(p.id, { activo: false }, ctx);
    await expect(servicio.escanear(nuevo.token, 'U1', new Date(Date.now() + 3_600_000))).rejects.toThrow(ForbiddenException);
  });

  it('alterna entrada y salida, vincula al bombero y anota el nombre del punto', async () => {
    const p = await servicio.crearPunto('Puerta', ctx);
    const t0 = new Date('2026-03-10T08:00:00');
    const entrada = await servicio.escanear(p.token, 'U1', t0);
    const salida = await servicio.escanear(p.token, 'U1', new Date(t0.getTime() + 8 * 3_600_000));
    expect([entrada.tipo, salida.tipo]).toEqual(['ENTRADA', 'SALIDA']);
    expect(entrada).toMatchObject({ duplicado: false, punto: 'Puerta' });
    expect(base.tabla('Fichaje')[0]).toMatchObject({ bomberoId: 'B1', usuarioId: 'U1' });
  });

  it('un doble escaneo dentro del antirrebote no registra otro fichaje', async () => {
    const p = await servicio.crearPunto('Puerta', ctx);
    const t0 = new Date('2026-03-10T08:00:00');
    await servicio.escanear(p.token, 'U1', t0);
    const repetido = await servicio.escanear(p.token, 'U1', new Date(t0.getTime() + (ANTIRREBOTE_SEGUNDOS - 1) * 1000));
    expect(repetido).toMatchObject({ duplicado: true, tipo: 'ENTRADA' });
    expect(base.tabla('Fichaje')).toHaveLength(1);
    const despues = await servicio.escanear(p.token, 'U1', new Date(t0.getTime() + (ANTIRREBOTE_SEGUNDOS + 1) * 1000));
    expect(despues).toMatchObject({ duplicado: false, tipo: 'SALIDA' });
  });

  it('cada usuario tiene su propia secuencia', async () => {
    await sembrar(base, Usuario, { id: 'U2', username: 'luis', bomberoId: null });
    const p = await servicio.crearPunto('Puerta', ctx);
    const t0 = new Date('2026-03-10T08:00:00');
    await servicio.escanear(p.token, 'U1', t0);
    expect(await servicio.escanear(p.token, 'U2', t0)).toMatchObject({ tipo: 'ENTRADA' });
  });
});

// Entidad referenciada por nombre de tabla en las pruebas.
void PuntoFichaje;
