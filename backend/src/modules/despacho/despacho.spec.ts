import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DisponibilidadPersonal, Servicio, ServicioParticipante, Usuario, Vehiculo, VehiculoAutorizado } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { DespachoTiempoReal } from './despacho-tiempo-real.service';
import {
  agruparSeguimiento,
  disponiblePorHorario,
  estaEnLinea,
  estadoEfectivo,
  evaluarEntrega,
  exigirMotivo,
  siguienteEstado,
  textoSolicitud,
  type DestinatarioResumen,
} from './despacho.logica';
import { DespachoService } from './despacho.service';

// martes 6 de octubre de 2026, hora local
const martes = (h: number, m = 0) => new Date(2026, 9, 6, h, m, 0);

describe('máquina de estados de un destinatario', () => {
  it('sigue el camino pendiente → acepta → en camino → llegó', () => {
    expect(siguienteEstado('PENDIENTE', 'ACEPTAR')).toBe('ACEPTO');
    expect(siguienteEstado('ACEPTO', 'EN_CAMINO')).toBe('EN_CAMINO');
    expect(siguienteEstado('EN_CAMINO', 'LLEGUE')).toBe('LLEGO');
  });
  it('aceptar no es definitivo: se puede cancelar y volver a aceptar', () => {
    expect(siguienteEstado('ACEPTO', 'CANCELAR')).toBe('CANCELO');
    expect(siguienteEstado('CANCELO', 'ACEPTAR')).toBe('ACEPTO');
    expect(siguienteEstado('EN_CAMINO', 'CANCELAR')).toBe('CANCELO');
  });
  it('quien dijo que no puede puede cambiar de idea', () => {
    expect(siguienteEstado('PENDIENTE', 'NO_PUEDO')).toBe('NO_PUEDE');
    expect(siguienteEstado('NO_PUEDE', 'ACEPTAR')).toBe('ACEPTO');
  });
  it.each([
    ['PENDIENTE', 'EN_CAMINO'],
    ['PENDIENTE', 'LLEGUE'],
    ['PENDIENTE', 'CANCELAR'],
    ['ACEPTO', 'LLEGUE'],
    ['LLEGO', 'CANCELAR'],
    ['LLEGO', 'ACEPTAR'],
    ['NO_PUEDE', 'EN_CAMINO'],
  ] as const)('%s no admite %s', (estado, accion) => {
    expect(() => siguienteEstado(estado, accion)).toThrow(ConflictException);
  });
  it('"no puedo" exige motivo; cancelar no', () => {
    expect(() => exigirMotivo('NO_PUEDO', '  ')).toThrow(BadRequestException);
    expect(exigirMotivo('NO_PUEDO', 'estoy trabajando')).toBe('estoy trabajando');
    expect(exigirMotivo('CANCELAR', undefined)).toBeNull();
  });
});

describe('horarios y excepciones', () => {
  const lunAVie = [1, 2, 3, 4, 5].map((d) => ({ diaSemana: d, horaDesde: '18:00', horaHasta: '23:00' }));
  it('sin horario no hay restricción', () => {
    expect(disponiblePorHorario(false, [], [], martes(4))).toBe(true);
  });
  it('con horario solo vale dentro de la franja', () => {
    expect(disponiblePorHorario(true, lunAVie, [], martes(19))).toBe(true);
    expect(disponiblePorHorario(true, lunAVie, [], martes(17, 59))).toBe(false);
    expect(disponiblePorHorario(true, lunAVie, [], martes(23))).toBe(false);
  });
  it('un día que no está en el horario queda afuera (sábado)', () => {
    expect(disponiblePorHorario(true, lunAVie, [], new Date(2026, 9, 10, 19))).toBe(false);
  });
  it('una franja que cruza la medianoche vale a ambos lados', () => {
    const noche = [{ diaSemana: 2, horaDesde: '22:00', horaHasta: '06:00' }];
    expect(disponiblePorHorario(true, noche, [], martes(23))).toBe(true);
    expect(disponiblePorHorario(true, noche, [], martes(5))).toBe(true);
    expect(disponiblePorHorario(true, noche, [], martes(12))).toBe(false);
  });
  it('una excepción habilita fuera de horario, y una de bloqueo gana siempre', () => {
    const habilita = [{ fechaDesde: '2026-10-06', fechaHasta: '2026-10-06', disponible: true, horaDesde: null, horaHasta: null }];
    const bloquea = [{ fechaDesde: '2026-10-01', fechaHasta: '2026-10-10', disponible: false, horaDesde: null, horaHasta: null }];
    expect(disponiblePorHorario(true, lunAVie, habilita, martes(10))).toBe(true);
    expect(disponiblePorHorario(true, lunAVie, [...habilita, ...bloquea], martes(19))).toBe(false);
    expect(disponiblePorHorario(false, [], bloquea, martes(10))).toBe(false);
  });
  it('una excepción con horas solo cubre esas horas', () => {
    const e = [{ fechaDesde: '2026-10-06', fechaHasta: '2026-10-06', disponible: false, horaDesde: '12:00', horaHasta: '14:00' }];
    expect(disponiblePorHorario(false, [], e, martes(13))).toBe(false);
    expect(disponiblePorHorario(false, [], e, martes(15))).toBe(true);
  });
});

describe('entrega: se separa "no disponible", "sin conexión" y "recibió"', () => {
  const base = { estado: 'AL_LLAMADO' as const, temporalHasta: null, enHorario: true, enLinea: true };
  const ahora = martes(15);
  it('al llamado y en línea: se envía', () => expect(evaluarEntrega(base, ahora)).toBe('ENVIADA'));
  it('al llamado sin conexión: NO recibe y queda registrado como sin conexión', () =>
    expect(evaluarEntrega({ ...base, enLinea: false }, ahora)).toBe('SIN_CONEXION'));
  it('no disponible: no recibe, aunque esté en línea', () => expect(evaluarEntrega({ ...base, estado: 'NO_DISPONIBLE' }, ahora)).toBe('NO_DISPONIBLE'));
  it('no disponible Y sin conexión: gana no disponible (fue su decisión)', () =>
    expect(evaluarEntrega({ ...base, estado: 'NO_DISPONIBLE', enLinea: false }, ahora)).toBe('NO_DISPONIBLE'));
  it('en camino o en servicio: es un estado incompatible', () => {
    expect(evaluarEntrega({ ...base, estado: 'EN_CAMINO' }, ahora)).toBe('EN_SERVICIO');
    expect(evaluarEntrega({ ...base, estado: 'EN_SERVICIO' }, ahora)).toBe('EN_SERVICIO');
  });
  it('fuera de su horario no recibe', () => expect(evaluarEntrega({ ...base, enHorario: false }, ahora)).toBe('FUERA_DE_HORARIO'));
  it('el temporal vigente ignora el horario; vencido equivale a no disponible', () => {
    const vigente = new Date(ahora.getTime() + 3_600_000);
    expect(evaluarEntrega({ ...base, enHorario: false, temporalHasta: vigente }, ahora)).toBe('ENVIADA');
    const vencido = new Date(ahora.getTime() - 1000);
    expect(estadoEfectivo('AL_LLAMADO', vencido, ahora)).toBe('NO_DISPONIBLE');
  });
  it('presencia: stream abierto o actividad reciente', () => {
    expect(estaEnLinea(1, null, ahora)).toBe(true);
    expect(estaEnLinea(0, new Date(ahora.getTime() - 30_000), ahora)).toBe(true);
    expect(estaEnLinea(0, new Date(ahora.getTime() - 120_000), ahora)).toBe(false);
    expect(estaEnLinea(0, null, ahora)).toBe(false);
  });
});

describe('seguimiento y texto', () => {
  const d = (usuarioNombre: string, o: Partial<DestinatarioResumen>): DestinatarioResumen => ({
    usuarioId: usuarioNombre, usuarioNombre, entrega: 'ENVIADA', estado: 'PENDIENTE', recibidaEn: null, vistoTardeEn: null,
    aceptadaEn: null, enCaminoEn: null, llegoEn: null, canceladaEn: null, motivo: null, ampliacion: false, ...o,
  });
  it('cada persona cae en un solo grupo y los motivos de no recepción no se mezclan', () => {
    const g = agruparSeguimiento([
      d('juan', { estado: 'EN_CAMINO' }),
      d('pedro', { estado: 'ACEPTO' }),
      d('carlos', { recibidaEn: new Date() }),
      d('maria', {}),
      d('jose', { estado: 'NO_PUEDE', motivo: 'Estoy trabajando' }),
      d('luis', { estado: 'CANCELO' }),
      d('ana', { entrega: 'SIN_CONEXION' }),
      d('beto', { entrega: 'NO_DISPONIBLE' }),
      d('cris', { entrega: 'FUERA_DE_HORARIO' }),
      d('dani', { entrega: 'EN_SERVICIO' }),
      d('eva', { entrega: 'NO_DISPONIBLE', ampliacion: true }),
    ]);
    expect(g.enCamino.map((x) => x.usuarioNombre)).toEqual(['juan']);
    expect(g.aceptaron.map((x) => x.usuarioNombre)).toEqual(['pedro']);
    expect(g.sinResponder.map((x) => x.usuarioNombre).sort()).toEqual(['carlos', 'eva']);
    expect(g.enviadasSinConfirmar.map((x) => x.usuarioNombre)).toEqual(['maria']);
    expect(g.noPueden[0].motivo).toBe('Estoy trabajando');
    expect(g.cancelaron.map((x) => x.usuarioNombre)).toEqual(['luis']);
    expect(g.noRecibieron.sinConexion.map((x) => x.usuarioNombre)).toEqual(['ana']);
    expect(g.noRecibieron.noDisponible.map((x) => x.usuarioNombre)).toEqual(['beto']);
    expect(g.noRecibieron.fueraDeHorario.map((x) => x.usuarioNombre)).toEqual(['cris']);
    expect(g.noRecibieron.enServicio.map((x) => x.usuarioNombre)).toEqual(['dani']);
  });
  it('el texto dice para qué móviles se pide chofer', () => {
    expect(textoSolicitud('CHOFER', ['Móvil 1', 'Móvil 3'], null)).toBe('Se solicita chofer para: Móvil 1 + Móvil 3');
    expect(textoSolicitud('PERSONAL', [], null)).toBe('Se solicita personal para servicio');
    expect(textoSolicitud('RAPIDA', [], 'Incendio en Ruta 2')).toBe('Solicitud rápida: se necesita personal — Incendio en Ruta 2');
  });
});

// ---------------------------------------------------------------- servicio completo

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('DespachoService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let tiempoReal: DespachoTiempoReal;
  let servicio: DespachoService;
  const ahora = martes(15);
  const jefe = { usuarioId: 'jefe', username: 'jefe' };
  const ctx = (id: string) => ({ usuarioId: id, username: id });

  const persona = async (id: string, estado: string, opciones: { enLinea?: boolean; usaHorario?: boolean } = {}) => {
    await sembrar(base, Usuario, { id, username: id, estado: 'ACTIVO', bomberoId: `b-${id}` });
    await sembrar(base, DisponibilidadPersonal, {
      id: `d-${id}`, usuarioId: id, estado, desde: ahora, solicitudId: null, usaHorario: opciones.usaHorario ?? false,
      temporalHasta: null, ultimaActividad: null, version: 0, actualizadoEn: ahora,
    });
    if (opciones.enLinea !== false) tiempoReal.conectar(id, ahora);
  };

  beforeEach(async () => {
    base = new BaseFalsa({ copias: true });
    audit = { registrar: jest.fn(async () => undefined) };
    tiempoReal = new DespachoTiempoReal();
    const policy = { getPermisosEfectivos: jest.fn(async () => ['despacho:responder']) };
    servicio = new DespachoService(base as unknown as DataSource, audit as never, policy as never, tiempoReal);
    await sembrar(base, Usuario, { id: 'jefe', username: 'jefe', estado: 'ACTIVO', bomberoId: null });
    await sembrar(base, Vehiculo, { id: 'm1', numeroInterno: '1', alias: 'Ford Ranger', estado: 'DISPONIBLE' });
    await sembrar(base, Vehiculo, { id: 'm3', numeroInterno: '3', alias: null, estado: 'DISPONIBLE' });
  });

  /** Habilita a una persona para conducir esos moviles (personal.vehiculos_autorizados). */
  const habilitar = async (id: string, ...moviles: string[]) => {
    for (const m of moviles) await sembrar(base, VehiculoAutorizado, { bomberoId: `b-${id}`, vehiculoId: m, categoria: null, fechaAutorizacion: null, vigencia: null, capacitaciones: null });
  };

  const crearChofer = async () => {
    await persona('ana', 'AL_LLAMADO');
    await persona('beto', 'NO_DISPONIBLE');
    await persona('cris', 'AL_LLAMADO', { enLinea: false });
    await persona('dani', 'EN_CAMINO');
    await persona('eva', 'AL_LLAMADO', { usaHorario: true });
    for (const id of ['ana', 'beto', 'cris', 'dani', 'eva']) await habilitar(id, 'm1', 'm3');
    return servicio.crearSolicitud({ tipo: 'CHOFER', moviles: ['m1', 'm3'] }, jefe, ahora);
  };

  it('solicitar chofer: dice para qué móviles y separa por qué cada persona no lo recibió', async () => {
    const eventos: unknown[] = [];
    tiempoReal.flujoPara('ana', false).subscribe((e) => eventos.push(e));
    tiempoReal.flujoPara('beto', false).subscribe((e) => eventos.push(e));
    const s = await crearChofer();
    expect(s.texto).toBe('Se solicita chofer para: Móvil 1 — Ford Ranger + Móvil 3');
    const porNombre = (n: string) => [...s.grupos.aceptaron, ...s.grupos.sinResponder, ...s.grupos.enviadasSinConfirmar, ...Object.values(s.grupos.noRecibieron).flat()].find((x) => x.usuarioNombre === n)!;
    expect(porNombre('ana').entrega).toBe('ENVIADA');
    expect(porNombre('beto').entrega).toBe('NO_DISPONIBLE');
    expect(porNombre('cris').entrega).toBe('SIN_CONEXION');
    expect(porNombre('dani').entrega).toBe('EN_SERVICIO');
    expect(s.grupos.noRecibieron.noDisponible).toHaveLength(1);
    expect(s.grupos.noRecibieron.sinConexion).toHaveLength(1);
    expect(s.grupos.noRecibieron.enServicio).toHaveLength(1);
    // solo a quien se le pudo enviar le llega el aviso en tiempo real
    expect(eventos).toHaveLength(1);
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CREAR_SOLICITUD' }));
  });

  it('solicitar chofer: quien no está habilitado para esos móviles no lo recibe, y queda anotado por qué', async () => {
    await persona('ana', 'AL_LLAMADO');
    await habilitar('ana', 'm1', 'm3');
    await persona('zeta', 'AL_LLAMADO'); // disponible y en línea, pero sin autorización para conducir
    await persona('mica', 'AL_LLAMADO');
    await habilitar('mica', 'm1'); // habilitada para uno de los dos moviles: alcanza
    const s = await servicio.crearSolicitud({ tipo: 'CHOFER', moviles: ['m1', 'm3'] }, jefe, ahora);
    expect(s.grupos.noRecibieron.noHabilitadoChofer.map((x) => x.usuarioNombre)).toEqual(['zeta']);
    expect(s.grupos.noRecibieron.noDisponible).toHaveLength(0);
    expect([...s.grupos.sinResponder, ...s.grupos.enviadasSinConfirmar].map((x) => x.usuarioNombre).sort()).toEqual(['ana', 'mica']);
    expect(await servicio.misSolicitudes('zeta')).toHaveLength(0);
    await expect(servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('zeta'), ahora)).rejects.toBeInstanceOf(ForbiddenException);
    // pedir personal en general no exige habilitación de conducción
    const p = await servicio.crearSolicitud({ tipo: 'PERSONAL' }, jefe, ahora);
    expect(p.grupos.noRecibieron.noHabilitadoChofer).toHaveLength(0);
    expect((await servicio.misSolicitudes('zeta')).map((x) => x.solicitudId)).toEqual([p.id]);
  });

  it('el creador no se avisa a sí mismo y la solicitud rápida no pide móviles', async () => {
    await persona('ana', 'AL_LLAMADO');
    const s = await servicio.crearSolicitud({ tipo: 'RAPIDA' }, jefe, ahora);
    expect(s.moviles).toEqual([]);
    expect(s.totales.destinatarios).toBe(1);
    await expect(servicio.crearSolicitud({ tipo: 'CHOFER' }, jefe, ahora)).rejects.toBeInstanceOf(BadRequestException);
    await expect(servicio.crearSolicitud({ tipo: 'CHOFER', moviles: ['inexistente'] }, jefe, ahora)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('un reintento con la misma clave no duplica la solicitud', async () => {
    await persona('ana', 'AL_LLAMADO');
    const a = await servicio.crearSolicitud({ tipo: 'PERSONAL', claveIdempotencia: 'clave-123456' }, jefe, ahora);
    const b = await servicio.crearSolicitud({ tipo: 'PERSONAL', claveIdempotencia: 'clave-123456' }, jefe, ahora);
    expect(b.duplicada).toBe(true);
    expect(b.id).toBe(a.id);
  });

  it('el camino completo deja la línea de tiempo en orden y cambia el estado de la persona', async () => {
    const s = await crearChofer();
    await servicio.confirmarRecepcion(s.id, 'ana', martes(15, 1));
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('ana'), martes(15, 2));
    await servicio.responder(s.id, { accion: 'EN_CAMINO' }, ctx('ana'), martes(15, 5));
    expect((await servicio.miDisponibilidad('ana', martes(15, 5))).estado).toBe('EN_CAMINO');
    await servicio.responder(s.id, { accion: 'LLEGUE' }, ctx('ana'), martes(15, 12));
    expect((await servicio.miDisponibilidad('ana', martes(15, 12))).estado).toBe('EN_SERVICIO');

    const linea = (await servicio.linea(s.id)).map((e) => `${e.tipo}${e.destinatarioId ? ':' + e.destinatarioId : ''}`);
    expect(linea[0]).toBe('SOLICITUD_CREADA');
    expect(linea.indexOf('RECIBIDA:ana')).toBeLessThan(linea.indexOf('ACEPTO:ana'));
    expect(linea.indexOf('ACEPTO:ana')).toBeLessThan(linea.indexOf('EN_CAMINO:ana'));
    expect(linea.indexOf('EN_CAMINO:ana')).toBeLessThan(linea.indexOf('LLEGO:ana'));
    const det = await servicio.detalle(s.id);
    expect(det.totales).toMatchObject({ aceptaron: 1, llegaron: 1, enCamino: 0 });
  });

  it('cancelar conserva la hora original de aceptación y registra la cancelación', async () => {
    const s = await crearChofer();
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('ana'), martes(15, 2));
    await servicio.responder(s.id, { accion: 'CANCELAR', motivo: 'me surgió algo' }, ctx('ana'), martes(15, 9));
    const det = await servicio.detalle(s.id);
    expect(det.grupos.cancelaron[0]).toMatchObject({ usuarioNombre: 'ana', motivo: 'me surgió algo' });
    expect(det.grupos.cancelaron[0].aceptadaEn).toEqual(martes(15, 2));
    expect(det.grupos.cancelaron[0].canceladaEn).toEqual(martes(15, 9));
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('ana'), martes(15, 20));
    expect((await servicio.detalle(s.id)).grupos.aceptaron[0].aceptadaEn).toEqual(martes(15, 2));
  });

  it('"no puedo" exige motivo y queda registrado', async () => {
    const s = await crearChofer();
    await expect(servicio.responder(s.id, { accion: 'NO_PUEDO' }, ctx('ana'), ahora)).rejects.toBeInstanceOf(BadRequestException);
    await servicio.responder(s.id, { accion: 'NO_PUEDO', motivo: 'Estoy trabajando' }, ctx('ana'), ahora);
    expect((await servicio.detalle(s.id)).grupos.noPueden[0].motivo).toBe('Estoy trabajando');
  });

  it('quien no recibió la alerta no puede responderla', async () => {
    const s = await crearChofer();
    await expect(servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('beto'), ahora)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('nadie'), ahora)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sin conexión al enviar: al reconectar queda como "vista tarde", no como recibida a tiempo', async () => {
    const s = await crearChofer();
    await servicio.confirmarRecepcion(s.id, 'cris', martes(15, 40));
    const det = await servicio.detalle(s.id);
    const cris = det.grupos.noRecibieron.sinConexion[0];
    expect(cris.usuarioNombre).toBe('cris');
    expect(cris.recibidaEn).toBeNull();
    expect(cris.vistoTardeEn).toEqual(martes(15, 40));
    expect((await servicio.linea(s.id)).some((e) => e.tipo === 'VISTA_TARDIA')).toBe(true);
    // y aun asi puede responder lo que vio
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('cris'), martes(15, 41));
    expect((await servicio.detalle(s.id)).grupos.aceptaron.map((x) => x.usuarioNombre)).toContain('cris');
  });

  it('dos respuestas simultáneas de la misma persona: gana una, la otra recibe conflicto', async () => {
    const s = await crearChofer();
    const resultados = await Promise.allSettled([
      servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('ana'), ahora),
      servicio.responder(s.id, { accion: 'NO_PUEDO', motivo: 'otro dispositivo' }, ctx('ana'), ahora),
    ]);
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rechazo = resultados.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    expect(rechazo.reason).toBeInstanceOf(ConflictException);
  });

  it('no se puede estar en camino a dos solicitudes a la vez', async () => {
    await persona('ana', 'AL_LLAMADO');
    const a = await servicio.crearSolicitud({ tipo: 'PERSONAL' }, jefe, ahora);
    const b = await servicio.crearSolicitud({ tipo: 'RAPIDA' }, jefe, ahora);
    await servicio.responder(a.id, { accion: 'ACEPTAR' }, ctx('ana'), ahora);
    await servicio.responder(a.id, { accion: 'EN_CAMINO' }, ctx('ana'), ahora);
    await servicio.responder(b.id, { accion: 'ACEPTAR' }, ctx('ana'), ahora);
    await expect(servicio.responder(b.id, { accion: 'EN_CAMINO' }, ctx('ana'), ahora)).rejects.toBeInstanceOf(ConflictException);
  });

  it('en camino o en servicio no se puede cambiar la disponibilidad a mano', async () => {
    await persona('ana', 'EN_CAMINO');
    await expect(servicio.cambiarDisponibilidad({ estado: 'NO_DISPONIBLE' }, ctx('ana'), ahora)).rejects.toBeInstanceOf(ConflictException);
    await persona('beto', 'NO_DISPONIBLE');
    const r = await servicio.cambiarDisponibilidad({ estado: 'AL_LLAMADO' }, ctx('beto'), ahora);
    expect(r.estado).toBe('AL_LLAMADO');
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CAMBIAR_DISPONIBILIDAD' }));
  });

  it('buscar personal adicional: avisa a los no disponibles en línea y se suman de forma temporal', async () => {
    const s = await crearChofer();
    const avisos: unknown[] = [];
    tiempoReal.flujoPara('beto', false).subscribe((e) => avisos.push(e));
    const sinAvisar: unknown[] = [];
    tiempoReal.flujoPara('cris', false).subscribe((e) => sinAvisar.push(e));
    const r = await servicio.ampliar(s.id, jefe, ahora);
    // beto (no disponible) y eva (fuera de su horario) siguen en línea; cris está sin conexión y dani en servicio
    expect(r.avisados).toBe(2);
    expect(avisos).toHaveLength(1);
    expect(sinAvisar).toHaveLength(0);

    const u = await servicio.unirmeAmpliacion(s.id, ctx('beto'), ahora);
    expect(u.temporalHasta).toEqual(new Date(ahora.getTime() + 4 * 3_600_000));
    const disp = await servicio.miDisponibilidad('beto', ahora);
    expect(disp.estado).toBe('AL_LLAMADO');
    expect(disp.estadoDeclarado).toBe('AL_LLAMADO');
    // pasado el plazo, vuelve solo a NO_DISPONIBLE sin tocar nada más
    expect((await servicio.miDisponibilidad('beto', new Date(ahora.getTime() + 5 * 3_600_000))).estado).toBe('NO_DISPONIBLE');

    const det = await servicio.detalle(s.id);
    expect(det.grupos.sinResponder.map((x) => x.usuarioNombre)).toContain('beto');
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('beto'), ahora);
  });

  it('cerrar: una solicitud cerrada no admite respuestas; cancelar libera a quien venía en camino', async () => {
    await persona('ana', 'AL_LLAMADO');
    const s = await servicio.crearSolicitud({ tipo: 'PERSONAL' }, jefe, ahora);
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('ana'), ahora);
    await servicio.responder(s.id, { accion: 'EN_CAMINO' }, ctx('ana'), ahora);
    await servicio.cerrar(s.id, { estado: 'CANCELADA', motivo: 'falsa alarma' }, jefe, ahora);
    expect((await servicio.miDisponibilidad('ana', ahora)).estado).toBe('AL_LLAMADO');
    await expect(servicio.responder(s.id, { accion: 'LLEGUE' }, ctx('ana'), ahora)).rejects.toBeInstanceOf(ConflictException);
    await expect(servicio.cerrar(s.id, { estado: 'CERRADA' }, jefe, ahora)).rejects.toBeInstanceOf(ConflictException);
    const tipos = (await servicio.linea(s.id)).map((e) => e.tipo);
    expect(tipos).toContain('SOLICITUD_CANCELADA');
  });

  it('lo que ve quien recibe: solo sus solicitudes abiertas y su propio estado', async () => {
    const s = await crearChofer();
    const mias = await servicio.misSolicitudes('ana');
    expect(mias).toHaveLength(1);
    expect(mias[0]).toMatchObject({ solicitudId: s.id, miEstado: 'PENDIENTE', entrega: 'ENVIADA' });
    // quien estaba en "no disponible" no la ve en su lista
    expect(await servicio.misSolicitudes('beto')).toHaveLength(0);
    // quien estaba sin conexion la ve al reconectar, marcada como tardia
    expect((await servicio.misSolicitudes('cris'))[0].tardia).toBe(true);
  });

  it('una solicitud vinculada a un servicio hace participante a quien sale en camino, llega o cancela', async () => {
    await sembrar(base, Servicio, { id: 'serv1', tipoServicioId: 't1', numeroServicio: 'S-1', estado: 'EN_CURSO', direccion: 'x', fechaHoraAviso: ahora });
    await persona('ana', 'AL_LLAMADO');
    const s = await servicio.crearSolicitud({ tipo: 'PERSONAL', servicioId: 'serv1' }, jefe, ahora);
    const parte = async () => ((await base.getRepository(ServicioParticipante as never).find({ where: { servicioId: 'serv1', usuarioId: 'ana' } })) as unknown as ServicioParticipante[])[0];
    expect(await parte()).toBeUndefined();
    await servicio.responder(s.id, { accion: 'ACEPTAR' }, ctx('ana'), ahora);
    expect(await parte()).toBeUndefined(); // aceptar es una intencion: todavia no participa
    await servicio.responder(s.id, { accion: 'EN_CAMINO' }, ctx('ana'), martes(15, 5));
    expect((await parte()).estado).toBe('EN_CAMINO');
    await servicio.responder(s.id, { accion: 'LLEGUE' }, ctx('ana'), martes(15, 12));
    expect(await parte()).toMatchObject({ estado: 'EN_SITIO' });
    await expect(servicio.crearSolicitud({ tipo: 'PERSONAL', servicioId: 'no-existe' }, jefe, ahora)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('horarios y excepciones se guardan y se aplican', async () => {
    await persona('ana', 'AL_LLAMADO');
    const r = await servicio.guardarHorarios({ franjas: [{ diaSemana: 2, horaDesde: '18:00', horaHasta: '23:00' }], usaHorario: true }, ctx('ana'), martes(19));
    expect(r.usaHorario).toBe(true);
    expect(r.enHorarioAhora).toBe(true);
    expect((await servicio.miDisponibilidad('ana', martes(10))).enHorarioAhora).toBe(false);
    const e = await servicio.agregarExcepcion({ fechaDesde: '2026-10-06', fechaHasta: '2026-10-06', disponible: true }, ctx('ana'), martes(10));
    expect(e.enHorarioAhora).toBe(true);
    await expect(servicio.guardarHorarios({ franjas: [{ diaSemana: 1, horaDesde: '10:00', horaHasta: '10:00' }] }, ctx('ana'), ahora)).rejects.toBeInstanceOf(BadRequestException);
    await expect(servicio.agregarExcepcion({ fechaDesde: '2026-10-07', fechaHasta: '2026-10-06', disponible: true }, ctx('ana'), ahora)).rejects.toBeInstanceOf(BadRequestException);
  });
});
