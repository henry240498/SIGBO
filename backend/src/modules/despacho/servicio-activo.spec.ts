import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Despacho, DisponibilidadPersonal, FormularioDefinicion, FormularioHistorial, Pantalla, Servicio, ServicioMensaje, TipoServicio, Vehiculo,
} from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { PantallasService } from '../pantallas/pantallas.service';
import { DespachoTiempoReal } from './despacho-tiempo-real.service';
import { clavesCambiadas, formularioDisponible, limpiarMensaje, redactarDatos, validarCampos, validarDatos, type CampoFormulario } from './servicio-activo.logica';
import { ServicioActivoService } from './servicio-activo.service';

const CAMPOS: CampoFormulario[] = [
  { clave: 'novedad', etiqueta: 'Novedad', tipo: 'texto_largo', requerido: true },
  { clave: 'personal', etiqueta: 'Personal en el lugar', tipo: 'numero' },
  { clave: 'apoyo', etiqueta: 'Requiere apoyo', tipo: 'si_no' },
  { clave: 'gravedad', etiqueta: 'Gravedad', tipo: 'opcion', opciones: ['Leve', 'Grave'] },
  { clave: 'interno', etiqueta: 'Observaciones internas', tipo: 'texto_largo', confidencial: true },
];

describe('formularios (lógica)', () => {
  it('valida y normaliza lo cargado; un borrador puede estar incompleto, completar exige lo requerido', () => {
    expect(validarDatos(CAMPOS, { personal: '5', apoyo: true, gravedad: 'Leve' }, false)).toEqual({ personal: 5, apoyo: true, gravedad: 'Leve' });
    expect(() => validarDatos(CAMPOS, { personal: 5 }, true)).toThrow(/Novedad/);
    expect(validarDatos(CAMPOS, { novedad: '  humo visible  ' }, true)).toEqual({ novedad: 'humo visible' });
  });
  it('rechaza claves ajenas, tipos incorrectos y opciones que no existen', () => {
    expect(() => validarDatos(CAMPOS, { otro: 1 }, false)).toThrow(BadRequestException);
    expect(() => validarDatos(CAMPOS, { personal: 'muchos' }, false)).toThrow(/número/);
    expect(() => validarDatos(CAMPOS, { apoyo: 'si' }, false)).toThrow(/Sí o No/);
    expect(() => validarDatos(CAMPOS, { gravedad: 'Media' }, false)).toThrow(/opciones/);
  });
  it('la definición exige claves únicas, tipos válidos y opciones suficientes', () => {
    expect(() => validarCampos([])).toThrow();
    expect(() => validarCampos([{ clave: 'A!', etiqueta: 'x', tipo: 'texto' }])).toThrow(/Clave/);
    expect(() => validarCampos([{ clave: 'a', etiqueta: 'x', tipo: 'texto' }, { clave: 'a', etiqueta: 'y', tipo: 'texto' }])).toThrow(/repetida/);
    expect(() => validarCampos([{ clave: 'a', etiqueta: 'x', tipo: 'opcion', opciones: ['solo'] }])).toThrow(/opciones/);
    expect(validarCampos([{ clave: 'a', etiqueta: 'x', tipo: 'texto' }])).toHaveLength(1);
  });
  it('lo confidencial se oculta a quien no puede verlo y se avisa que existe', () => {
    const datos = { novedad: 'x', interno: 'secreto' };
    expect(redactarDatos(CAMPOS, datos, true)).toEqual({ datos, ocultos: [] });
    expect(redactarDatos(CAMPOS, datos, false)).toEqual({ datos: { novedad: 'x' }, ocultos: ['interno'] });
  });
  it('detecta qué claves cambiaron', () => {
    expect(clavesCambiadas({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 }).sort()).toEqual(['b', 'c']);
  });
  it('un formulario se ofrece según tipo de servicio, rol, permiso y etapa', () => {
    const def = { tiposServicio: '["t1"]', roles: '["Jefe de Guardia"]', permisoRequerido: 'despacho:servicio', etapa: 'EN_CURSO' as const, activo: true };
    const ctx = { tipoServicioId: 't1', estadoServicio: 'EN_CURSO' as const, roles: ['jefe de guardia'], permisos: ['despacho:servicio'] };
    expect(formularioDisponible(def, ctx)).toBe(true);
    expect(formularioDisponible(def, { ...ctx, tipoServicioId: 't2' })).toBe(false);
    expect(formularioDisponible(def, { ...ctx, roles: ['Bombero'] })).toBe(false);
    expect(formularioDisponible(def, { ...ctx, permisos: [] })).toBe(false);
    expect(formularioDisponible(def, { ...ctx, estadoServicio: 'FINALIZADO' })).toBe(false);
    expect(formularioDisponible({ ...def, activo: false }, ctx)).toBe(false);
    expect(formularioDisponible({ tiposServicio: null, roles: null, permisoRequerido: null, etapa: null, activo: true }, ctx)).toBe(true);
  });
  it('el mensaje se limpia, se recorta y no puede estar vacío', () => {
    expect(limpiarMensaje('  Llegamos al lugar\u0007 ')).toBe('Llegamos al lugar');
    expect(limpiarMensaje('x'.repeat(900))).toHaveLength(500);
    expect(() => limpiarMensaje('   ')).toThrow(BadRequestException);
  });
});

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

const usuario = (id: string, ...permisos: string[]) => ({ id, email: `${id}@x`, username: id, roles: [], permisos: ['despacho:servicio', ...permisos] });

describe('ServicioActivoService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let tiempoReal: DespachoTiempoReal;
  let pantallas: PantallasService;
  let servicio: ServicioActivoService;
  const ahora = new Date(2026, 9, 6, 15, 0, 0);
  const ana = usuario('ana');
  const jefe = usuario('jefe', 'despacho:confidencial', 'despacho:seguimiento');

  beforeEach(async () => {
    base = new BaseFalsa({ copias: true });
    audit = { registrar: jest.fn(async () => undefined) };
    tiempoReal = new DespachoTiempoReal();
    pantallas = new PantallasService(base as unknown as DataSource, audit as never);
    servicio = new ServicioActivoService(base as unknown as DataSource, audit as never, pantallas, tiempoReal);
    for (const [codigo, nombre] of [['0xA001', 'Inicio'], ['0xA006', 'Servicio activo'], ['0xA007', 'Chat'], ['0xA008', 'Formularios'], ['0xA00E', 'Mapa del servicio']]) {
      await sembrar(base, Pantalla, { codigo, nombre, descripcion: null, confidencialAplica: true, activa: true });
    }
    await sembrar(base, TipoServicio, { id: 't1', nombre: 'Incendio estructural' });
    await sembrar(base, Servicio, {
      id: 's1', tipoServicioId: 't1', numeroServicio: 'S-2026-1', estado: 'EN_CURSO', direccion: 'Av. Mcal. López 1234', ciudad: 'Asunción',
      descripcion: 'Incendio en depósito', coordenadasLat: -25.28, coordenadasLon: -57.63, fechaHoraAviso: ahora,
    });
    await sembrar(base, Servicio, { id: 'sFin', tipoServicioId: 't1', numeroServicio: 'S-0', estado: 'FINALIZADO', direccion: 'x', fechaHoraAviso: ahora });
    await sembrar(base, FormularioDefinicion, {
      id: 'f1', codigo: 'NOVEDADES', nombre: 'Parte de novedades', descripcion: null, campos: JSON.stringify(CAMPOS), tiposServicio: null, roles: null,
      permisoRequerido: null, etapa: null, confidencial: false, activo: true, version: 1, actualizadoEn: ahora,
    });
  });

  it('servicios activos: solo los que se están atendiendo, con conteos y sin dirección para quien no tiene permiso', async () => {
    await servicio.unirme('s1', ana, ahora);
    const lista = await servicio.activos(ana);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ numeroServicio: 'S-2026-1', tipo: 'Incendio estructural', personal: 1, enCamino: 1, moviles: 0, direccion: null });
    expect((await servicio.activos(jefe))[0].direccion).toBe('Av. Mcal. López 1234');
  });

  it('el detalle oculta dirección, descripción y coordenadas; con permiso las muestra y el acceso queda auditado', async () => {
    const sin = await servicio.detalle('s1', ana);
    expect(sin).toMatchObject({ direccion: null, descripcion: null, coordenadasLat: null, hayConfidencial: true });
    expect(audit.registrar).not.toHaveBeenCalledWith(expect.objectContaining({ accion: 'ACCESO_CONFIDENCIAL' }));
    const con = await servicio.detalle('s1', jefe);
    expect(con).toMatchObject({ direccion: 'Av. Mcal. López 1234', descripcion: 'Incendio en depósito', coordenadasLat: -25.28 });
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'ACCESO_CONFIDENCIAL', recursoId: 's1' }));
  });

  it('la matriz le quita lo confidencial a quien el rol se lo daba', async () => {
    await pantallas.guardarRegla({ pantallaCodigo: '0xA006', sujetoTipo: 'USUARIO', sujetoId: 'jefe', ver: true, crear: true, editar: true, eliminar: false, confidencial: false, denegar: false }, { usuarioId: 'admin' });
    const r = await servicio.detalle('s1', jefe);
    expect(r.direccion).toBeNull();
    expect((await servicio.activos(jefe))[0].direccion).toBeNull();
  });

  it('la matriz puede cerrar la pantalla completa a una persona', async () => {
    await pantallas.guardarRegla({ pantallaCodigo: '0xA006', sujetoTipo: 'USUARIO', sujetoId: 'ana', ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: true }, { usuarioId: 'admin' });
    await expect(servicio.detalle('s1', ana)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('un servicio que no existe o ya terminó no admite participantes', async () => {
    await expect(servicio.unirme('nope', ana, ahora)).rejects.toBeInstanceOf(NotFoundException);
    await expect(servicio.unirme('sFin', ana, ahora)).rejects.toBeInstanceOf(ConflictException);
  });

  it('incorporarse es idempotente; llegar pone a la persona en servicio; retirarse la devuelve al llamado', async () => {
    await sembrar(base, DisponibilidadPersonal, { id: 'd1', usuarioId: 'ana', estado: 'EN_CAMINO', desde: ahora, solicitudId: null, usaHorario: false, temporalHasta: null, ultimaActividad: null, version: 0, actualizadoEn: ahora });
    const a = await servicio.unirme('s1', ana, ahora);
    const b = await servicio.unirme('s1', ana, ahora);
    expect(b.id).toBe(a.id);
    await expect(servicio.cambiarEstadoParticipacion('s1', 'RETIRADO', usuario('otro'), ahora)).rejects.toBeInstanceOf(ForbiddenException);
    await servicio.cambiarEstadoParticipacion('s1', 'EN_SITIO', ana, new Date(ahora.getTime() + 60_000));
    const d = (await base.getRepository(DisponibilidadPersonal as never).findOne({ where: { usuarioId: 'ana' } })) as unknown as DisponibilidadPersonal;
    expect(d.estado).toBe('EN_SERVICIO');
    await expect(servicio.cambiarEstadoParticipacion('s1', 'EN_SITIO', ana, ahora)).rejects.toBeInstanceOf(ConflictException);
    await servicio.cambiarEstadoParticipacion('s1', 'RETIRADO', ana, new Date(ahora.getTime() + 120_000));
    expect(((await base.getRepository(DisponibilidadPersonal as never).findOne({ where: { usuarioId: 'ana' } })) as unknown as DisponibilidadPersonal).estado).toBe('AL_LLAMADO');
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'LLEGADA_SERVICIO' }));
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'SALIDA_SERVICIO' }));
  });

  it('chat: solo participantes, el mensaje se limpia, el reenvío no duplica y avisa a los demás', async () => {
    await servicio.unirme('s1', ana, ahora);
    await servicio.unirme('s1', usuario('beto'), ahora);
    const avisos: unknown[] = [];
    tiempoReal.flujoPara('beto', false).subscribe((e) => avisos.push(e));
    await expect(servicio.enviarMensaje('s1', { texto: 'hola' }, usuario('ajeno'), ahora)).rejects.toBeInstanceOf(ForbiddenException);
    const m1 = await servicio.enviarMensaje('s1', { texto: ' Llegamos al lugar ', clave: 'clave-12345' }, ana, ahora);
    const m2 = await servicio.enviarMensaje('s1', { texto: ' Llegamos al lugar ', clave: 'clave-12345' }, ana, ahora);
    expect(m2.id).toBe(m1.id);
    expect(avisos).toHaveLength(1);
    await servicio.enviarMensaje('s1', { texto: 'Se necesita equipo de corte' }, usuario('beto'), new Date(ahora.getTime() + 5000));
    const todos = await servicio.mensajes('s1', ana);
    expect(todos.map((m) => m.texto)).toEqual(['Llegamos al lugar', 'Se necesita equipo de corte']);
    // con ids numericos, como en SQL Server, se pide solo lo posterior a un mensaje
    await sembrar(base, ServicioMensaje, { id: '100', servicioId: 's1', usuarioId: 'ana', usuarioNombre: 'ana', texto: 'cien', ocurridoEn: new Date(ahora.getTime() + 9000), registradoEn: ahora, claveIdempotencia: null });
    await sembrar(base, ServicioMensaje, { id: '101', servicioId: 's1', usuarioId: 'ana', usuarioNombre: 'ana', texto: 'ciento uno', ocurridoEn: new Date(ahora.getTime() + 9500), registradoEn: ahora, claveIdempotencia: null });
    expect((await servicio.mensajes('s1', ana, '100')).map((m) => m.texto)).toEqual(['ciento uno']);
    expect(await base.getRepository(ServicioMensaje as never).find({})).toHaveLength(4);
    await expect(servicio.mensajes('s1', usuario('ajeno'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  describe('formularios', () => {
    beforeEach(async () => {
      await servicio.unirme('s1', ana, ahora);
      await servicio.unirme('s1', jefe, ahora);
    });

    it('se ofrecen solo los formularios que corresponden y sin los campos confidenciales para quien no los ve', async () => {
      const lista = await servicio.formularios('s1', ana);
      expect(lista).toHaveLength(1);
      expect((lista[0].definicion as { campos: CampoFormulario[] }).campos.map((c) => c.clave)).not.toContain('interno');
      const conf = await servicio.formularios('s1', jefe);
      expect((conf[0].definicion as { campos: CampoFormulario[] }).campos.map((c) => c.clave)).toContain('interno');
    });

    it('un borrador se guarda incompleto; completar exige lo requerido; cada paso queda en el historial', async () => {
      const r = await servicio.crearRespuesta('s1', { definicionId: 'f1', datos: { personal: 4 } }, ana, ahora);
      expect(r.estado).toBe('BORRADOR');
      await expect(servicio.modificarRespuesta(r.id, { datos: { personal: 4 }, version: r.version, completar: true }, ana, ahora)).rejects.toBeInstanceOf(BadRequestException);
      const c = await servicio.modificarRespuesta(r.id, { datos: { personal: 4, novedad: 'Fuego controlado' }, version: r.version, completar: true }, ana, new Date(ahora.getTime() + 1000));
      expect(c.estado).toBe('COMPLETADO');
      const hist = await base.getRepository(FormularioHistorial as never).find({ where: { respuestaId: r.id } });
      expect((hist as unknown as FormularioHistorial[]).map((h) => h.accion)).toEqual(['CREAR', 'COMPLETAR']);
    });

    it('modificar no pisa en silencio: con una versión vieja se avisa y se conserva lo anterior', async () => {
      const r = await servicio.crearRespuesta('s1', { definicionId: 'f1', datos: { novedad: 'uno' } }, ana, ahora);
      await servicio.modificarRespuesta(r.id, { datos: { novedad: 'dos' }, version: r.version }, ana, ahora);
      await expect(servicio.modificarRespuesta(r.id, { datos: { novedad: 'tres' }, version: r.version }, ana, ahora)).rejects.toBeInstanceOf(ConflictException);
      const hist = (await servicio.historialRespuesta(r.id, ana)) as Array<{ datosAntes: Record<string, unknown> | null; datosDespues: Record<string, unknown> | null }>;
      const cambio = (hist as unknown as Array<{ accion: string; datosAntes: Record<string, unknown> | null; datosDespues: Record<string, unknown> | null }>).find((h) => h.accion === 'MODIFICAR')!;
      expect(cambio.datosAntes).toEqual({ novedad: 'uno' });
      expect(cambio.datosDespues).toEqual({ novedad: 'dos' });
    });

    it('un campo confidencial solo lo carga y lo ve quien tiene permiso', async () => {
      await expect(servicio.crearRespuesta('s1', { definicionId: 'f1', datos: { novedad: 'x', interno: 'dato' } }, ana, ahora)).rejects.toBeInstanceOf(ForbiddenException);
      const r = await servicio.crearRespuesta('s1', { definicionId: 'f1', datos: { novedad: 'x', interno: 'dato reservado' } }, jefe, ahora);
      expect(r.datos).toEqual({ novedad: 'x', interno: 'dato reservado' });
      const vista = (await servicio.formularios('s1', jefe))[0].respuesta as { datos: Record<string, unknown> };
      expect(vista.datos.interno).toBe('dato reservado');
    });

    it('anular conserva todo en el historial y no se puede modificar después; solo quien lo completó o un administrador', async () => {
      const r = await servicio.crearRespuesta('s1', { definicionId: 'f1', datos: { novedad: 'x' } }, ana, ahora);
      await expect(servicio.anularRespuesta(r.id, { version: r.version }, jefe, ahora)).rejects.toBeInstanceOf(ForbiddenException);
      const a = await servicio.anularRespuesta(r.id, { motivo: 'cargado por error', version: r.version }, ana, ahora);
      expect(a.estado).toBe('ANULADO');
      await expect(servicio.modificarRespuesta(r.id, { datos: { novedad: 'y' }, version: a.version }, ana, ahora)).rejects.toBeInstanceOf(ConflictException);
      const hist = (await base.getRepository(FormularioHistorial as never).find({ where: { respuestaId: r.id } })) as unknown as FormularioHistorial[];
      expect(hist.map((h) => h.accion)).toEqual(['CREAR', 'ANULAR']);
    });

    it('el historial de otra persona no se consulta sin permiso', async () => {
      const r = await servicio.crearRespuesta('s1', { definicionId: 'f1', datos: { novedad: 'x' } }, ana, ahora);
      await expect(servicio.historialRespuesta(r.id, jefe)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('definir formularios: la versión sube en cada cambio y se validan los campos', async () => {
      const dto = { codigo: 'CIERRE', nombre: 'Informe de cierre', campos: [{ clave: 'resumen', etiqueta: 'Resumen', tipo: 'texto_largo', requerido: true }], etapa: 'CIERRE' as const };
      const a = await servicio.guardarDefinicion(dto, jefe);
      expect(a.version).toBe(1);
      const b = await servicio.guardarDefinicion({ ...dto, nombre: 'Informe final' }, jefe);
      expect(b.version).toBe(2);
      await expect(servicio.guardarDefinicion({ ...dto, campos: [] }, jefe)).rejects.toBeInstanceOf(BadRequestException);
      const def = (await base.getRepository(FormularioDefinicion as never).find({ where: { codigo: 'CIERRE' } })) as unknown as FormularioDefinicion[];
      expect(def).toHaveLength(1);
    });
  });

  it('mapa: sin permiso confidencial no hay ubicación ni posiciones; con permiso sí y queda auditado', async () => {
    await sembrar(base, Vehiculo, { id: 'm1', numeroInterno: '1', alias: 'Ford Ranger' });
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', vehiculoId: 'm1', estado: 'DESPACHADO', horaSalida: ahora });
    await servicio.unirme('s1', ana, ahora);
    const sin = await servicio.mapa('s1', ana);
    expect(sin.servicio).toMatchObject({ ubicacion: null, ubicacionRestringida: true });
    expect(sin.moviles).toEqual([{ movil: 'Móvil 1 — Ford Ranger', estado: 'DESPACHADO', posicion: null }]);
    expect(sin.resumen.enCamino).toBe(1);
    const con = await servicio.mapa('s1', jefe);
    expect(con.servicio.ubicacion).toMatchObject({ latitud: -25.28, longitud: -57.63 });
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'ACCESO_CONFIDENCIAL' }));
  });
});

