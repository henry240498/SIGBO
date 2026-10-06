import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AsignacionRol, Bombero, LogAuditoria, NavegacionEvento, Pantalla, Servicio, SolicitudDespacho, SolicitudEvento, Usuario,
} from '../../shared/entities';
import type { PantallaPermiso as Regla } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { limitesDelDia, NavegacionService } from './navegacion.service';
import { decidir, duracionVisita, reglaAplica, type SujetoUsuario } from './pantallas.logica';
import { PantallasService } from './pantallas.service';

const sujeto: SujetoUsuario = { usuarioId: 'u1', rolIds: ['rolA', 'rolB'], rangoId: 'rango1', cargo: 'Jefe de Compañía' };
const regla = (o: Partial<Regla>): Regla =>
  ({ id: 'r', pantallaCodigo: '0xA006', sujetoTipo: 'ROL', sujetoId: 'rolA', ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false, creadoPor: null, creadoEn: new Date(), actualizadoEn: new Date(), ...o }) as Regla;

describe('matriz de permisos por pantalla (lógica)', () => {
  it('una regla le corresponde por usuario, rol, rango o cargo (sin distinguir mayúsculas)', () => {
    expect(reglaAplica({ sujetoTipo: 'USUARIO', sujetoId: 'U1' }, sujeto)).toBe(true);
    expect(reglaAplica({ sujetoTipo: 'ROL', sujetoId: 'rolB' }, sujeto)).toBe(true);
    expect(reglaAplica({ sujetoTipo: 'ROL', sujetoId: 'rolZ' }, sujeto)).toBe(false);
    expect(reglaAplica({ sujetoTipo: 'RANGO', sujetoId: 'rango1' }, sujeto)).toBe(true);
    expect(reglaAplica({ sujetoTipo: 'CARGO', sujetoId: 'jefe de compañía' }, sujeto)).toBe(true);
    expect(reglaAplica({ sujetoTipo: 'CARGO', sujetoId: 'otro' }, { ...sujeto, cargo: null })).toBe(false);
  });

  it('sin reglas rige el permiso por rol', () => {
    expect(decidir('0xA006', 'ver', ['despacho:servicio'], [], sujeto)).toEqual({ permitido: true, origen: 'BASE' });
    expect(decidir('0xA006', 'ver', [], [], sujeto)).toEqual({ permitido: false, origen: 'BASE' });
  });

  it('una pantalla sin permiso base definido no se abre por defecto', () => {
    expect(decidir('0xAFFF', 'ver', ['despacho:servicio'], [], sujeto).permitido).toBe(false);
  });

  it('la matriz restringe: con reglas aplicables hace falta el permiso base Y que alguna regla lo conceda', () => {
    const permisos = ['despacho:servicio'];
    expect(decidir('0xA006', 'ver', permisos, [regla({ ver: true })], sujeto)).toEqual({ permitido: true, origen: 'MATRIZ' });
    expect(decidir('0xA006', 'crear', permisos, [regla({ ver: true })], sujeto).permitido).toBe(false);
    // conceder en la matriz sin el permiso base no da más de lo que el rol permite
    expect(decidir('0xA006', 'ver', [], [regla({ ver: true })], sujeto).permitido).toBe(false);
  });

  it('la denegación de cualquier regla aplicable gana, incluso sobre una concesión de otro sujeto', () => {
    const permisos = ['despacho:servicio', 'despacho:confidencial'];
    const reglas = [regla({ sujetoId: 'rolA', ver: true, confidencial: true }), regla({ id: 'r2', sujetoTipo: 'USUARIO', sujetoId: 'u1', denegar: true })];
    expect(decidir('0xA006', 'ver', permisos, reglas, sujeto).permitido).toBe(false);
    expect(decidir('0xA006', 'confidencial', permisos, reglas, sujeto).permitido).toBe(false);
  });

  it('las reglas de otras personas no cuentan', () => {
    const ajena = regla({ sujetoId: 'rolZ', denegar: true });
    expect(decidir('0xA006', 'ver', ['despacho:servicio'], [ajena], sujeto).permitido).toBe(true);
  });

  it('lo confidencial lo deciden las reglas cuando las hay (pueden conceder o quitar); si no, el permiso por rol', () => {
    expect(decidir('0xA006', 'confidencial', ['despacho:confidencial'], [], sujeto).permitido).toBe(true);
    expect(decidir('0xA006', 'confidencial', [], [regla({ confidencial: true })], sujeto).permitido).toBe(true);
    expect(decidir('0xA006', 'confidencial', ['despacho:confidencial'], [regla({ ver: true, confidencial: false })], sujeto).permitido).toBe(false);
  });

  it('la duración de una visita se acota y no admite salidas anteriores a la entrada', () => {
    const e = new Date('2026-10-06T14:00:00Z');
    expect(duracionVisita(e, new Date('2026-10-06T14:02:30Z'))).toBe(150);
    expect(duracionVisita(e, new Date('2026-10-06T13:00:00Z'))).toBeNull();
    expect(duracionVisita(e, null)).toBeNull();
    expect(duracionVisita(e, new Date('2026-10-09T14:00:00Z'))).toBe(24 * 3600);
  });
});

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('PantallasService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let servicio: PantallasService;
  const admin = { usuarioId: 'admin' };

  beforeEach(async () => {
    base = new BaseFalsa({ copias: true });
    audit = { registrar: jest.fn(async () => undefined) };
    servicio = new PantallasService(base as unknown as DataSource, audit as never);
    await sembrar(base, Pantalla, { codigo: '0xA006', nombre: 'Servicio activo', descripcion: null, confidencialAplica: true, activa: true });
    await sembrar(base, Pantalla, { codigo: '0xA007', nombre: 'Chat', descripcion: null, confidencialAplica: false, activa: true });
    await sembrar(base, Bombero, { id: 'b1', rangoId: 'rangoSargento', cargo: 'Instructor' });
    await sembrar(base, Usuario, { id: 'u1', username: 'juan', estado: 'ACTIVO', bomberoId: 'b1' });
    await sembrar(base, AsignacionRol, { id: 'a1', usuarioId: 'u1', rolId: 'rolBombero', fechaExpiracion: null });
  });

  const user = (...permisos: string[]) => ({ id: 'u1', permisos });

  it('sin reglas funciona como antes (permiso por rol)', async () => {
    expect(await servicio.permite(user('despacho:servicio'), '0xA006', 'ver')).toBe(true);
    await expect(servicio.exigir(user(), '0xA006', 'ver')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('una regla por rango restringe a quien tiene ese rango', async () => {
    await servicio.guardarRegla({ pantallaCodigo: '0xA007', sujetoTipo: 'RANGO', sujetoId: 'rangoSargento', ver: true, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false }, admin);
    expect(await servicio.permite(user('despacho:servicio'), '0xA007', 'ver')).toBe(true);
    expect(await servicio.permite(user('despacho:servicio'), '0xA007', 'crear')).toBe(false);
    await expect(servicio.exigir(user('despacho:servicio'), '0xA007', 'crear')).rejects.toThrow(/Chat/);
  });

  it('una regla por cargo, por rol vigente o por usuario también aplica; una asignación vencida no', async () => {
    await servicio.guardarRegla({ pantallaCodigo: '0xA007', sujetoTipo: 'CARGO', sujetoId: 'instructor', ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: true }, admin);
    expect(await servicio.permite(user('despacho:servicio'), '0xA007', 'ver')).toBe(false);

    await servicio.guardarRegla({ pantallaCodigo: '0xA006', sujetoTipo: 'ROL', sujetoId: 'rolBombero', ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: true }, admin);
    expect(await servicio.permite(user('despacho:servicio'), '0xA006', 'ver')).toBe(false);
    await base.getRepository(AsignacionRol as never).update({ id: 'a1' }, { fechaExpiracion: new Date('2020-01-01') });
    expect(await servicio.permite(user('despacho:servicio'), '0xA006', 'ver')).toBe(true);
  });

  it('guardar una regla es un alta o una modificación, y queda auditado con lo anterior', async () => {
    const dto = { pantallaCodigo: '0xA007', sujetoTipo: 'USUARIO' as const, sujetoId: 'u1', ver: true, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false };
    await servicio.guardarRegla(dto, admin);
    await servicio.guardarRegla({ ...dto, crear: true }, admin);
    expect(await servicio.listarReglas('0xA007')).toHaveLength(1);
    expect(audit.registrar).toHaveBeenLastCalledWith(expect.objectContaining({ accion: 'CAMBIAR_PERMISO_PANTALLA', datosAntes: expect.objectContaining({ crear: false }) }));
    const [regla1] = await servicio.listarReglas('0xA007');
    await servicio.eliminarRegla(regla1.id, admin);
    expect(await servicio.listarReglas('0xA007')).toHaveLength(0);
    expect(audit.registrar).toHaveBeenLastCalledWith(expect.objectContaining({ accion: 'QUITAR_PERMISO_PANTALLA' }));
  });

  it('no se puede configurar una pantalla que no existe', async () => {
    await expect(servicio.guardarRegla({ pantallaCodigo: '0xA999', sujetoTipo: 'ROL', sujetoId: 'x', ver: true, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false }, admin)).rejects.toThrow();
  });

  it('"mis permisos" resume qué puede hacer la persona en cada pantalla', async () => {
    const mis = await servicio.misPermisos(user('despacho:servicio', 'despacho:confidencial'));
    const a006 = mis.find((p) => p.codigo === '0xA006')!;
    expect(a006).toMatchObject({ ver: true, crear: true, confidencial: true });
    expect(mis.map((p) => p.codigo)).toEqual(['0xA006', '0xA007']);
  });
});

describe('NavegacionService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let servicio: NavegacionService;
  const ahora = new Date(2026, 9, 6, 15, 0, 0);
  const ctx = { usuarioId: 'u1', username: 'juan', ip: '10.0.0.5' };
  const hora = (h: number, m = 0) => new Date(2026, 9, 6, h, m, 0).toISOString();

  beforeEach(async () => {
    base = new BaseFalsa({ copias: true });
    audit = { registrar: jest.fn(async () => undefined) };
    servicio = new NavegacionService(base as unknown as DataSource, audit as never);
    for (const [codigo, nombre] of [['0xA001', 'Inicio'], ['0xA002', 'Servicios'], ['0xA006', 'Servicio activo'], ['0xA007', 'Chat']]) {
      await sembrar(base, Pantalla, { codigo, nombre, descripcion: null, confidencialAplica: false, activa: true });
    }
    await sembrar(base, Usuario, { id: 'u1', username: 'juan', estado: 'ACTIVO', bomberoId: null });
  });

  it('guarda las visitas con su duración y rechaza pantallas desconocidas', async () => {
    const r = await servicio.registrar({ eventos: [
      { pantalla: '0xA001', entrada: hora(14, 31), salida: hora(14, 32), clave: 'clave-0001' },
      { pantalla: '0xA002', entrada: hora(14, 32), salida: hora(14, 33, ) },
      { pantalla: '0xA0FF', entrada: hora(14, 33) },
    ], dispositivo: 'Xiaomi' }, ctx, ahora);
    expect(r).toEqual({ guardados: 2, duplicados: 0, rechazados: ['0xA0FF'] });
    const filas = await base.getRepository(NavegacionEvento as never).find({});
    expect((filas as unknown as NavegacionEvento[])[0]).toMatchObject({ pantallaCodigo: '0xA001', duracionSeg: 60, usuarioNombre: 'juan', dispositivo: 'Xiaomi' });
  });

  it('un reenvío con la misma clave no duplica (cola sin conexión)', async () => {
    const lote = { eventos: [{ pantalla: '0xA001', entrada: hora(14, 31), clave: 'clave-0001' }] };
    await servicio.registrar(lote, ctx, ahora);
    expect(await servicio.registrar(lote, ctx, ahora)).toMatchObject({ guardados: 0, duplicados: 1 });
  });

  it('una hora futura se acota a la del servidor y una salida anterior a la entrada se descarta', async () => {
    await servicio.registrar({ eventos: [{ pantalla: '0xA001', entrada: new Date(2030, 0, 1).toISOString() }, { pantalla: '0xA002', entrada: hora(14, 40), salida: hora(14, 30) }] }, ctx, ahora);
    const filas = (await base.getRepository(NavegacionEvento as never).find({})) as unknown as NavegacionEvento[];
    expect(new Date(filas[0].entrada).getTime()).toBeLessThanOrEqual(ahora.getTime());
    expect(filas[1].salida).toBeNull();
  });

  it('la línea de una persona reconstruye cronológicamente su día: navegación, auditoría, solicitudes, chat', async () => {
    await servicio.registrar({ eventos: [
      { pantalla: '0xA001', entrada: hora(14, 31, ), salida: hora(14, 31) },
      { pantalla: '0xA002', entrada: hora(14, 31), salida: hora(14, 32) },
      { pantalla: '0xA006', entrada: hora(14, 32), salida: hora(14, 34), servicioId: 's1' },
      { pantalla: '0xA007', entrada: hora(14, 34), salida: hora(14, 36), servicioId: 's1' },
      { pantalla: '0xA006', entrada: hora(14, 36), servicioId: 's1' },
    ] }, ctx, ahora);
    await sembrar(base, LogAuditoria, { usuarioId: 'u1', accion: 'LOGIN', recurso: 'auth', recursoId: null, ip: '10.0.0.5', fecha: new Date(2026, 9, 6, 14, 30) });
    await sembrar(base, SolicitudEvento, { solicitudId: 'sol1', actorId: 'jefe', actorNombre: 'jefe', destinatarioId: 'u1', tipo: 'ENTREGA', detalle: '{"entrega":"ENVIADA"}', ocurridoEn: new Date(2026, 9, 6, 14, 20), registradoEn: new Date(2026, 9, 6, 14, 20) });
    await sembrar(base, SolicitudEvento, { solicitudId: 'sol1', actorId: 'otro', actorNombre: 'otro', destinatarioId: 'otro', tipo: 'ACEPTO', detalle: null, ocurridoEn: new Date(2026, 9, 6, 14, 21), registradoEn: new Date(2026, 9, 6, 14, 21) });
    await sembrar(base, Servicio, { id: 's1', numeroServicio: 'S-1', estado: 'EN_CURSO' });

    const r = await servicio.lineaDeUsuario('u1', '2026-10-06', undefined, { usuarioId: 'admin', username: 'admin' });
    const titulos = r.linea.map((e) => e.titulo);
    expect(titulos[0]).toBe('ENTREGA · jefe');
    expect(titulos[1]).toBe('LOGIN · auth');
    expect(titulos.filter((t) => t.startsWith('0xA'))).toEqual(['0xA001 — Inicio', '0xA002 — Servicios', '0xA006 — Servicio activo', '0xA007 — Chat', '0xA006 — Servicio activo']);
    expect(titulos).not.toContain('ACEPTO · otro');
    expect(r.servicios).toEqual([{ id: 's1', numero: 'S-1', estado: 'EN_CURSO' }]);
    expect(r.totales.pantallasVisitadas).toBe(5);
    expect(r.totales.segundosEnPantallas).toBe(0 + 60 + 120 + 120 + 0);
    // quien mira queda registrado
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CONSULTAR_AUDITORIA_NAVEGACION', usuarioId: 'admin' }));
  });

  it('se puede acotar a un servicio', async () => {
    await servicio.registrar({ eventos: [
      { pantalla: '0xA001', entrada: hora(14, 31) },
      { pantalla: '0xA006', entrada: hora(14, 32), servicioId: 's1' },
      { pantalla: '0xA006', entrada: hora(14, 40), servicioId: 's2' },
    ] }, ctx, ahora);
    const r = await servicio.lineaDeUsuario('u1', '2026-10-06', 's1', { usuarioId: 'admin', username: 'admin' });
    expect(r.linea.map((e) => e.servicioId)).toEqual(['s1']);
  });

  it('al acotar a un servicio solo cuentan las solicitudes vinculadas a ese servicio (y los ids se comparan sin distinguir mayúsculas)', async () => {
    await sembrar(base, SolicitudDespacho, { id: 'solA', tipo: 'PERSONAL', servicioId: 'S1', estado: 'ABIERTA', creadaPor: 'jefe', creadaPorNombre: 'jefe' });
    await sembrar(base, SolicitudDespacho, { id: 'solB', tipo: 'PERSONAL', servicioId: null, estado: 'ABIERTA', creadaPor: 'jefe', creadaPorNombre: 'jefe' });
    const casos: Array<[string, number]> = [['solA', 20], ['solB', 21]];
    for (const [sol, min] of casos) {
      await sembrar(base, SolicitudEvento, { solicitudId: sol, actorId: 'jefe', actorNombre: 'jefe', destinatarioId: 'u1', tipo: 'ENTREGA', detalle: null, ocurridoEn: new Date(2026, 9, 6, 14, min), registradoEn: new Date() });
    }
    const todo = await servicio.lineaDeUsuario('u1', '2026-10-06', undefined, { usuarioId: 'admin', username: 'admin' });
    expect(todo.linea.filter((e) => e.origen === 'SOLICITUD')).toHaveLength(2);
    const acotado = await servicio.lineaDeUsuario('u1', '2026-10-06', 's1', { usuarioId: 'admin', username: 'admin' });
    expect(acotado.linea.filter((e) => e.origen === 'SOLICITUD')).toHaveLength(1);
    expect(acotado.linea.every((e) => e.servicioId?.toLowerCase() === 's1')).toBe(true);
  });

  it('la fecha tiene que ser válida', async () => {
    expect(() => limitesDelDia('06/10/2026')).toThrow(BadRequestException);
    expect(() => limitesDelDia('2026-10-06')).not.toThrow();
  });
});

