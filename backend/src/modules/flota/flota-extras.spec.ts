import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AsignacionGuardia,
  Bombero,
  Convocatoria,
  ConvocatoriaRespuesta,
  Despacho,
  DotacionMovil,
  Guardia,
  HistorialServicio,
  Servicio,
  Vehiculo,
} from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { DisponibilidadService, guardiaVigente } from './disponibilidad.service';
import { DotacionService, faltante } from './dotacion.service';
import { duracion, generarPdfInforme } from './informe-intervencion.pdf';
import { InformeService } from './informe.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('guardiaVigente', () => {
  const g = (extra = {}) => ({ fecha: '2026-03-10', horaInicio: '08:00:00', horaFin: '20:00:00', estado: 'CONFIRMADA', ...extra });
  const en = (iso: string) => new Date(iso); // hora local

  it('dentro y fuera del horario diurno', () => {
    expect(guardiaVigente(g(), en('2026-03-10T12:00:00'))).toBe(true);
    expect(guardiaVigente(g(), en('2026-03-10T07:59:59'))).toBe(false);
    expect(guardiaVigente(g(), en('2026-03-10T20:00:00'))).toBe(false);
  });

  it('un turno que cruza la medianoche sigue vigente al dia siguiente', () => {
    const nocturna = g({ horaInicio: '20:00:00', horaFin: '08:00:00' });
    expect(guardiaVigente(nocturna, en('2026-03-10T23:00:00'))).toBe(true);
    expect(guardiaVigente(nocturna, en('2026-03-11T03:00:00'))).toBe(true);
    expect(guardiaVigente(nocturna, en('2026-03-11T08:00:00'))).toBe(false);
    expect(guardiaVigente(nocturna, en('2026-03-10T10:00:00'))).toBe(false);
  });

  it('una guardia cancelada, anulada o finalizada no esta vigente', () => {
    for (const estado of ['CANCELADA', 'ANULADA', 'FINALIZADA']) {
      expect(guardiaVigente(g({ estado }), en('2026-03-10T12:00:00'))).toBe(false);
    }
  });
});

describe('DotacionService', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: DotacionService;
  const ctx = { usuarioId: 'u1' };

  beforeEach(async () => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new DotacionService(base as unknown as DataSource, auditoria as never);
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '10' });
    await sembrar(base, Vehiculo, { id: 'V2', numeroInterno: '20' });
  });

  it('faltante: null sin control, 0 si esta completo, positivo si falta', () => {
    expect(faltante({ cantidadObjetivo: 4, cantidadActual: null })).toBeNull();
    expect(faltante({ cantidadObjetivo: 4, cantidadActual: 4 })).toBe(0);
    expect(faltante({ cantidadObjetivo: 4, cantidadActual: 6 })).toBe(0);
    expect(faltante({ cantidadObjetivo: 4, cantidadActual: 1 })).toBe(3);
  });

  it('crea items sin control previo y rechaza repetidos (sin distinguir mayusculas)', async () => {
    const i = await servicio.crear('V1', { descripcion: 'Hacha', cantidadObjetivo: 2 }, ctx);
    expect(i).toMatchObject({ cantidadActual: null, faltante: null, activo: true });
    await expect(servicio.crear('V1', { descripcion: 'HACHA', cantidadObjetivo: 1 }, ctx)).rejects.toThrow(BadRequestException);
    await expect(servicio.crear('NO', { descripcion: 'Soga', cantidadObjetivo: 1 }, ctx)).rejects.toThrow(NotFoundException);
    // el mismo item en OTRO movil es valido
    await expect(servicio.crear('V2', { descripcion: 'Hacha', cantidadObjetivo: 1 }, ctx)).resolves.toBeDefined();
  });

  it('el control registra lo hallado y calcula faltantes', async () => {
    const a = await servicio.crear('V1', { descripcion: 'Hacha', cantidadObjetivo: 2 }, ctx);
    const b = await servicio.crear('V1', { descripcion: 'Linterna', cantidadObjetivo: 4 }, ctx);
    const r = await servicio.registrarControl('V1', { lecturas: [{ itemId: a.id, cantidadActual: 2 }, { itemId: b.id, cantidadActual: 1 }] }, ctx);
    expect(r.map((x) => [x.descripcion, x.faltante])).toEqual([['Hacha', 0], ['Linterna', 3]]);
    const lista = await servicio.listar('V1');
    expect(lista.find((x) => x.descripcion === 'Linterna')).toMatchObject({ cantidadActual: 1, faltante: 3, controladoPor: 'u1' });
  });

  it('el control es todo o nada: un item ajeno o repetido no guarda nada', async () => {
    const a = await servicio.crear('V1', { descripcion: 'Hacha', cantidadObjetivo: 2 }, ctx);
    const otroMovil = await servicio.crear('V2', { descripcion: 'Soga', cantidadObjetivo: 1 }, ctx);
    await expect(
      servicio.registrarControl('V1', { lecturas: [{ itemId: a.id, cantidadActual: 1 }, { itemId: otroMovil.id, cantidadActual: 1 }] }, ctx),
    ).rejects.toThrow(BadRequestException);
    await expect(
      servicio.registrarControl('V1', { lecturas: [{ itemId: a.id, cantidadActual: 1 }, { itemId: a.id, cantidadActual: 2 }] }, ctx),
    ).rejects.toThrow(/repetidos/);
    expect((await servicio.listar('V1'))[0].cantidadActual).toBeNull();
  });

  it('dar de baja un item lo saca del listado y de los faltantes', async () => {
    const a = await servicio.crear('V1', { descripcion: 'Hacha', cantidadObjetivo: 2 }, ctx);
    await servicio.registrarControl('V1', { lecturas: [{ itemId: a.id, cantidadActual: 0 }] }, ctx);
    expect(await servicio.faltantes()).toHaveLength(1);
    await servicio.actualizar(a.id, { activo: false }, ctx);
    expect(await servicio.listar('V1')).toHaveLength(0);
    expect(await servicio.faltantes()).toHaveLength(0);
  });

  it('faltantes agrupa por movil y omite lo completo o sin controlar', async () => {
    const hacha = await servicio.crear('V1', { descripcion: 'Hacha', cantidadObjetivo: 2 }, ctx);
    const soga = await servicio.crear('V2', { descripcion: 'Soga', cantidadObjetivo: 3 }, ctx);
    await servicio.crear('V2', { descripcion: 'Casco', cantidadObjetivo: 5 }, ctx); // sin controlar
    await servicio.registrarControl('V1', { lecturas: [{ itemId: hacha.id, cantidadActual: 2 }] }, ctx); // completo
    await servicio.registrarControl('V2', { lecturas: [{ itemId: soga.id, cantidadActual: 1 }] }, ctx);
    const f = await servicio.faltantes();
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ numeroInterno: '20', descripcion: 'Soga', faltante: 2 });
  });

  it('bitacora: kilometros recorridos solo cuando hay salida y regreso', async () => {
    await sembrar(base, Servicio, { id: 'S1', numeroServicio: 'SRV-1', direccion: 'Calle 1' });
    await sembrar(base, Despacho, { vehiculoId: 'V1', servicioId: 'S1', estado: 'CERRADO', horaSalida: new Date('2026-01-01T10:00:00Z'), kmSalida: 1000, kmRegreso: 1012 });
    await sembrar(base, Despacho, { vehiculoId: 'V1', servicioId: 'S1', estado: 'CANCELADO', horaSalida: new Date('2026-01-02T10:00:00Z'), kmSalida: 1012, kmRegreso: null });
    const b = await servicio.bitacora('V1');
    expect(b.map((x) => x.kmRecorridos)).toEqual([null, 12]); // el mas reciente primero
    expect(b[1]).toMatchObject({ numeroServicio: 'SRV-1', direccion: 'Calle 1' });
  });
});

describe('DisponibilidadService', () => {
  it('separa moviles disponibles, en servicio y no operativos; lista el personal de la guardia vigente', async () => {
    const base = new BaseFalsa();
    const servicio = new DisponibilidadService(base as unknown as DataSource);
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '10', estado: 'OPERATIVO', estadoOperativo: 'EN_CUARTEL' });
    await sembrar(base, Vehiculo, { id: 'V2', numeroInterno: '20', estado: 'OPERATIVO', estadoOperativo: 'EN_SERVICIO' });
    await sembrar(base, Vehiculo, { id: 'V3', numeroInterno: '30', estado: 'EN_MANTENIMIENTO', estadoOperativo: 'EN_CUARTEL' });
    await sembrar(base, Vehiculo, { id: 'V4', numeroInterno: '40', estado: 'BAJA', estadoOperativo: 'EN_CUARTEL' });

    await sembrar(base, Guardia, { id: 'G1', fecha: '2026-03-10', horaInicio: '08:00:00', horaFin: '20:00:00', estado: 'CONFIRMADA' });
    await sembrar(base, Guardia, { id: 'G2', fecha: '2026-03-10', horaInicio: '20:00:00', horaFin: '08:00:00', estado: 'CONFIRMADA' }); // aun no empieza
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gomez', numeroBombero: '101' });
    await sembrar(base, AsignacionGuardia, { guardiaId: 'G1', bomberoId: 'B1', estado: 'CONFIRMADO', rol: 'Chofer', tipoParticipacion: 'TITULAR' });
    await sembrar(base, AsignacionGuardia, { guardiaId: 'G1', bomberoId: 'B2', estado: 'AUSENTE', rol: null, tipoParticipacion: 'TITULAR' });
    await sembrar(base, AsignacionGuardia, { guardiaId: 'G2', bomberoId: 'B1', estado: 'ASIGNADO', rol: null, tipoParticipacion: 'TITULAR' });

    await sembrar(base, Convocatoria, { id: 'C1', mensaje: 'Incendio', estado: 'ABIERTA' });
    await sembrar(base, ConvocatoriaRespuesta, { convocatoriaId: 'C1', usuarioId: 'u1', respuesta: 'VOY', etaMinutos: 12 });
    await sembrar(base, ConvocatoriaRespuesta, { convocatoriaId: 'C1', usuarioId: 'u2', respuesta: 'VOY', etaMinutos: 5 });
    await sembrar(base, ConvocatoriaRespuesta, { convocatoriaId: 'C1', usuarioId: 'u3', respuesta: 'NO_PUEDO', etaMinutos: null });
    await sembrar(base, Convocatoria, { id: 'C2', mensaje: 'Vieja', estado: 'CERRADA' });

    const d = await servicio.consultar(new Date('2026-03-10T12:00:00'));
    expect(d.moviles.total).toBe(3);
    expect(d.moviles.disponibles.map((m) => m.numeroInterno)).toEqual(['10']);
    expect(d.moviles.enServicio.map((m) => m.numeroInterno)).toEqual(['20']);
    expect(d.moviles.noOperativos.map((m) => m.numeroInterno)).toEqual(['30']);
    expect(d.personalDeGuardia.guardiasVigentes).toBe(1);
    expect(d.personalDeGuardia.personal).toEqual([
      expect.objectContaining({ bomberoId: 'B1', nombre: 'Gomez, Ana', numeroBombero: '101', rol: 'Chofer' }),
    ]);
    expect(d.convocatorias).toEqual([{ id: 'C1', mensaje: 'Incendio', voy: 2, noPuedo: 1, menorEtaMinutos: 5 }]);
  });
});

describe('informe de intervencion', () => {
  it('duracion legible', () => {
    const t = (s: string) => new Date(`2026-01-01T${s}Z`);
    expect(duracion(t('10:00:00'), t('10:00:42'))).toBe('42 s');
    expect(duracion(t('10:00:00'), t('10:05:07'))).toBe('5 min 7 s');
    expect(duracion(t('10:00:00'), t('12:30:00'))).toBe('2 h 30 min');
    expect(duracion(null, t('10:00:00'))).toBe('—');
  });

  it('reune los datos de los registros y arma un PDF valido con la leyenda de no-informe', async () => {
    const base = new BaseFalsa();
    const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    const servicio = new InformeService(base as unknown as DataSource, auditoria as never);
    await sembrar(base, Servicio, {
      id: 'S1', numeroServicio: 'SRV-7', estado: 'EN_CURSO', gravedad: 'GRAVE', direccion: 'Av. Principal 123', ciudad: 'Asuncion',
      descripcion: 'Incendio de vivienda', tipoServicioId: 'T1', fechaHoraAviso: new Date('2026-03-10T10:00:00Z'),
      fechaHoraSalida: new Date('2026-03-10T10:02:00Z'), fechaHoraLlegada: new Date('2026-03-10T10:09:00Z'), fechaHoraFin: null,
    });
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '10' });
    await sembrar(base, Despacho, {
      servicioId: 'S1', vehiculoId: 'V1', estado: 'EN_SERVICIO', horaSalida: new Date('2026-03-10T10:02:00Z'),
      horaLlegada: new Date('2026-03-10T10:09:00Z'), kmSalida: 100, kmRegreso: null, motivoCancelacion: null,
    });
    await sembrar(base, HistorialServicio, { servicioId: 'S1', movilId: 'V1', tipoEvento: 'SALIDA_CUARTEL', timestampEvento: new Date('2026-03-10T10:02:00Z'), observacion: null });
    await sembrar(base, HistorialServicio, { servicioId: 'S1', movilId: 'V1', tipoEvento: 'LLEGADA_SERVICIO', timestampEvento: new Date('2026-03-10T10:09:00Z'), observacion: null });

    const datos = await servicio.reunirDatos('S1', 'operador');
    expect(datos.despachos).toEqual([expect.objectContaining({ movil: '10', kmRecorridos: null })]);
    expect(datos.cronologia.map((e) => e.evento)).toEqual(['Salida del cuartel', 'Llegada al lugar']);
    expect(datos.llamado).toBeNull();

    const pdf = await generarPdfInforme(datos);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1500);

    const archivo = await servicio.generarPdf('S1', 'u1', 'operador');
    expect(archivo.nombreArchivo).toBe('resumen-operativo-SRV-7.pdf');
    expect(auditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'EXPORTAR_RESUMEN_OPERATIVO', usuarioId: 'u1' }));
    await expect(servicio.reunirDatos('no-existe', 'x')).rejects.toThrow(NotFoundException);
  });
});

// DotacionMovil se importa para que ts-jest resuelva la entidad usada por el servicio.
void DotacionMovil;
