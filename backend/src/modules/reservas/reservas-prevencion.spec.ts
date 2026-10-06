import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Instalacion, PuntoRiesgo } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { PrevencionService } from '../prevencion/prevencion.service';
import { MAX_HORAS_RESERVA, ReservasService, seSuperponen } from './reservas.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

/** Fecha futura a partir de hoy, redondeada a la hora. */
const enHoras = (h: number) => new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000 + h * 3_600_000).toISOString();

describe('seSuperponen', () => {
  const d = (a: string, b: string) => ({ inicio: new Date(a), fin: new Date(b) });
  it('detecta cruces, contencion e igualdad', () => {
    expect(seSuperponen(d('2026-01-01T10:00:00Z', '2026-01-01T12:00:00Z'), d('2026-01-01T11:00:00Z', '2026-01-01T13:00:00Z'))).toBe(true);
    expect(seSuperponen(d('2026-01-01T10:00:00Z', '2026-01-01T14:00:00Z'), d('2026-01-01T11:00:00Z', '2026-01-01T12:00:00Z'))).toBe(true);
    expect(seSuperponen(d('2026-01-01T10:00:00Z', '2026-01-01T12:00:00Z'), d('2026-01-01T10:00:00Z', '2026-01-01T12:00:00Z'))).toBe(true);
  });
  it('una reserva que empieza justo cuando termina otra NO se pisa', () => {
    expect(seSuperponen(d('2026-01-01T10:00:00Z', '2026-01-01T12:00:00Z'), d('2026-01-01T12:00:00Z', '2026-01-01T14:00:00Z'))).toBe(false);
    expect(seSuperponen(d('2026-01-01T10:00:00Z', '2026-01-01T12:00:00Z'), d('2026-01-02T10:00:00Z', '2026-01-02T12:00:00Z'))).toBe(false);
  });
});

describe('ReservasService', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: ReservasService;
  const admin = { usuarioId: 'adm', puedeDecidir: true };
  const usuario = { usuarioId: 'u1', puedeDecidir: false };
  const otro = { usuarioId: 'u2', puedeDecidir: false };
  let salon: Instalacion;

  const pedido = (extra: Record<string, unknown> = {}) => ({
    instalacionId: salon.id, titulo: 'Reunion', solicitanteNombre: 'Ana', inicio: enHoras(24), fin: enHoras(26), ...extra,
  });

  beforeEach(async () => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new ReservasService(base as unknown as DataSource, auditoria as never);
    salon = (await servicio.crearInstalacion({ nombre: 'Salon', capacidad: 50 }, admin)) as Instalacion;
  });

  it('no admite dos instalaciones con el mismo nombre (sin distinguir mayusculas)', async () => {
    await expect(servicio.crearInstalacion({ nombre: 'SALON' }, admin)).rejects.toThrow(ConflictException);
  });

  it('solicita una reserva en estado SOLICITADA y audita', async () => {
    const r = await servicio.solicitar(pedido(), usuario);
    expect(r).toMatchObject({ estado: 'SOLICITADA', creadoPor: 'u1', conflictoConAprobada: false });
    expect(auditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'SOLICITAR', usuarioId: 'u1' }));
  });

  it('valida fechas, duracion, pasado, instalacion y capacidad', async () => {
    await expect(servicio.solicitar(pedido({ inicio: enHoras(26), fin: enHoras(24) }), usuario)).rejects.toThrow(BadRequestException);
    await expect(servicio.solicitar(pedido({ inicio: enHoras(1), fin: enHoras(1 + MAX_HORAS_RESERVA + 1) }), usuario)).rejects.toThrow(/dias/);
    await expect(servicio.solicitar(pedido({ inicio: enHoras(-5), fin: enHoras(-3) }), usuario)).rejects.toThrow(/pasado/);
    await expect(servicio.solicitar(pedido({ instalacionId: 'no-existe' }), usuario)).rejects.toThrow(NotFoundException);
    await expect(servicio.solicitar(pedido({ personas: 80 }), usuario)).rejects.toThrow(/admite 50/);
    await servicio.actualizarInstalacion(salon.id, { activo: false }, admin);
    await expect(servicio.solicitar(pedido(), usuario)).rejects.toThrow(NotFoundException);
  });

  it('solo quien puede decidir aprueba; rechazar exige motivo', async () => {
    const r = await servicio.solicitar(pedido(), usuario);
    await expect(servicio.decidir(r.id, { decision: 'APROBAR' }, usuario)).rejects.toThrow(ForbiddenException);
    await expect(servicio.decidir(r.id, { decision: 'RECHAZAR' }, admin)).rejects.toThrow(BadRequestException);
    const ok = await servicio.decidir(r.id, { decision: 'APROBAR' }, admin);
    expect(ok).toMatchObject({ estado: 'APROBADA', decididoPor: 'adm' });
    await expect(servicio.decidir(r.id, { decision: 'APROBAR' }, admin)).rejects.toThrow(ConflictException); // ya decidida
  });

  it('no aprueba una reserva que se pisa con otra aprobada, pero SI las que quedan libres', async () => {
    const a = await servicio.solicitar(pedido({ titulo: 'A' }), usuario);
    const b = await servicio.solicitar(pedido({ titulo: 'B', inicio: enHoras(25), fin: enHoras(27) }), otro);
    expect(b.conflictoConAprobada).toBe(false); // todavia no hay ninguna aprobada
    await servicio.decidir(a.id, { decision: 'APROBAR' }, admin);
    await expect(servicio.decidir(b.id, { decision: 'APROBAR' }, admin)).rejects.toThrow(/Se superpone con la reserva aprobada "A"/);
    // una pegada (empieza cuando A termina) se aprueba
    const c = await servicio.solicitar(pedido({ titulo: 'C', inicio: enHoras(26), fin: enHoras(28) }), otro);
    await expect(servicio.decidir(c.id, { decision: 'APROBAR' }, admin)).resolves.toMatchObject({ estado: 'APROBADA' });
    // el aviso de conflicto aparece al solicitar sobre una aprobada
    const d = await servicio.solicitar(pedido({ titulo: 'D' }), otro);
    expect(d.conflictoConAprobada).toBe(true);
  });

  it('en otra instalacion el mismo horario no choca', async () => {
    const patio = (await servicio.crearInstalacion({ nombre: 'Patio' }, admin)) as Instalacion;
    const a = await servicio.solicitar(pedido(), usuario);
    const b = await servicio.solicitar(pedido({ instalacionId: patio.id }), otro);
    await servicio.decidir(a.id, { decision: 'APROBAR' }, admin);
    await expect(servicio.decidir(b.id, { decision: 'APROBAR' }, admin)).resolves.toBeDefined();
  });

  it('la cancela quien la pidio o quien decide, nunca un tercero; una vez cancelada no se toca', async () => {
    const r = await servicio.solicitar(pedido(), usuario);
    await expect(servicio.cancelar(r.id, {}, otro)).rejects.toThrow(ForbiddenException);
    await expect(servicio.cancelar(r.id, { motivo: 'Ya no hace falta' }, usuario)).resolves.toMatchObject({ estado: 'CANCELADA' });
    await expect(servicio.cancelar(r.id, {}, admin)).rejects.toThrow(ConflictException);
    const r2 = await servicio.solicitar(pedido(), usuario);
    await expect(servicio.cancelar(r2.id, {}, admin)).resolves.toMatchObject({ estado: 'CANCELADA' });
  });

  it('una reserva cancelada libera el horario', async () => {
    const a = await servicio.solicitar(pedido({ titulo: 'A' }), usuario);
    await servicio.decidir(a.id, { decision: 'APROBAR' }, admin);
    const b = await servicio.solicitar(pedido({ titulo: 'B' }), otro);
    await servicio.cancelar(a.id, {}, admin);
    await expect(servicio.decidir(b.id, { decision: 'APROBAR' }, admin)).resolves.toMatchObject({ estado: 'APROBADA' });
  });

  it('lista por estado y valida el rango', async () => {
    const a = await servicio.solicitar(pedido(), usuario);
    await servicio.solicitar(pedido({ inicio: enHoras(48), fin: enHoras(50) }), usuario);
    await servicio.decidir(a.id, { decision: 'APROBAR' }, admin);
    expect(await servicio.listar({ estado: 'APROBADA' })).toHaveLength(1);
    expect(await servicio.listar({})).toHaveLength(2);
    await expect(servicio.listar({ desde: '2026-03-31', hasta: '2026-03-01' })).rejects.toThrow(BadRequestException);
    await expect(servicio.listar({ desde: '2020-01-01', hasta: '2026-03-01' })).rejects.toThrow(/366/);
  });
});

describe('PrevencionService', () => {
  let base: BaseFalsa;
  let servicio: PrevencionService;
  const ctx = { usuarioId: 'insp' };
  const hoy = '2026-03-10';
  const aprobada = (extra: Record<string, unknown> = {}) => ({
    establecimiento: 'Panaderia Sol', direccion: 'Calle 1', fecha: '2026-03-01', resultado: 'APROBADO' as const,
    certificadoNumero: 'C-001', certificadoVence: '2027-03-01', ...extra,
  });

  beforeEach(() => {
    base = new BaseFalsa();
    servicio = new PrevencionService(base as unknown as DataSource, { registrar: jest.fn().mockResolvedValue(undefined) } as never);
  });

  it('una inspeccion aprobada exige certificado con numero y vencimiento posterior', async () => {
    await expect(servicio.registrar(aprobada({ certificadoNumero: undefined }), ctx, hoy)).rejects.toThrow(BadRequestException);
    await expect(servicio.registrar(aprobada({ certificadoVence: undefined }), ctx, hoy)).rejects.toThrow(BadRequestException);
    await expect(servicio.registrar(aprobada({ certificadoVence: '2026-03-01' }), ctx, hoy)).rejects.toThrow(/despues/);
    await expect(servicio.registrar(aprobada(), ctx, hoy)).resolves.toMatchObject({ resultado: 'APROBADO', inspectorId: 'insp' });
  });

  it('una no aprobada no puede llevar certificado', async () => {
    await expect(servicio.registrar(aprobada({ resultado: 'RECHAZADO' }), ctx, hoy)).rejects.toThrow(/Solo una inspeccion APROBADA/);
    await expect(
      servicio.registrar({ ...aprobada({ resultado: 'CON_OBSERVACIONES' }), certificadoNumero: undefined, certificadoVence: undefined }, ctx, hoy),
    ).resolves.toBeDefined();
  });

  it('no acepta fecha futura, certificado repetido ni punto de riesgo inexistente', async () => {
    await expect(servicio.registrar(aprobada({ fecha: '2026-04-01' }), ctx, hoy)).rejects.toThrow(/futura/);
    await servicio.registrar(aprobada(), ctx, hoy);
    await expect(servicio.registrar(aprobada({ establecimiento: 'Otro' }), ctx, hoy)).rejects.toThrow(/ya fue emitido/);
    await expect(servicio.registrar(aprobada({ certificadoNumero: 'C-002', puntoRiesgoId: 'no-existe' }), ctx, hoy)).rejects.toThrow(NotFoundException);
    await sembrar(base, PuntoRiesgo, { id: 'P1' });
    await expect(servicio.registrar(aprobada({ certificadoNumero: 'C-003', puntoRiesgoId: 'P1' }), ctx, hoy)).resolves.toBeDefined();
  });

  it('el estado se calcula con la ULTIMA inspeccion de cada establecimiento', async () => {
    // vigente
    await servicio.registrar(aprobada(), ctx, hoy);
    // por vencer en 20 dias
    await servicio.registrar(aprobada({ establecimiento: 'Kiosco', certificadoNumero: 'C-010', certificadoVence: '2026-03-30' }), ctx, hoy);
    // vencido
    await servicio.registrar(aprobada({ establecimiento: 'Taller', fecha: '2025-01-01', certificadoNumero: 'C-020', certificadoVence: '2026-01-15' }), ctx, hoy);
    // tenia certificado, pero la reinspeccion fue rechazada: pendiente
    await servicio.registrar(aprobada({ establecimiento: 'Bar', fecha: '2025-06-01', certificadoNumero: 'C-030', certificadoVence: '2026-06-01' }), ctx, hoy);
    await servicio.registrar({ establecimiento: 'bar', direccion: 'Calle 9', fecha: '2026-03-05', resultado: 'RECHAZADO', observaciones: 'Sin extintores' }, ctx, hoy);

    const r = await servicio.estadoActual(30, hoy);
    expect(r.map((x) => [x.establecimiento, x.estado])).toEqual([
      ['Taller', 'VENCIDO'],
      ['bar', 'PENDIENTE'],
      ['Kiosco', 'POR_VENCER'],
      ['Panaderia Sol', 'VIGENTE'],
    ]);
    expect(r[0].diasRestantes).toBeLessThan(0);
    expect(r[2].diasRestantes).toBe(20);
  });
});
