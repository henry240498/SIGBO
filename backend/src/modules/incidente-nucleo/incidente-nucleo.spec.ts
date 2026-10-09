import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Bombero, Despacho, IncidenteEvento, Parametro, PersonalServicio, Servicio, ServicioParticipante, Usuario } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { CronologiaService } from './cronologia.service';
import { MotorFases } from './motor-fases.service';
import { politicaHoras, validarParticipacion } from './politicas';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('CronologiaService', () => {
  let base: BaseFalsa;
  const cronologia = new CronologiaService();

  beforeEach(async () => {
    base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', username: 'jperez', bomberoId: 'b1' });
    await sembrar(base, Bombero, { id: 'b1', nombre: 'Juan', apellido: 'Pérez', numeroBombero: 'BC-12' });
    await sembrar(base, Usuario, { id: 'u2', username: 'central', bomberoId: null });
  });

  it('guarda el evento con el nombre del bombero y los datos en JSON', async () => {
    const e = await cronologia.registrar(base as never, {
      servicioId: 's1', tipo: 'COMUNICACION', titulo: 'Móvil 1 informa llegada', usuarioId: 'u1',
      gps: { latitud: -25.3, longitud: -57.6, precisionM: 8 }, datos: { texto: 'llegamos' },
    });
    expect(e).toMatchObject({
      servicioId: 's1', tipo: 'COMUNICACION', usuarioNombre: 'Juan Pérez (BC-12)', origen: 'WEB',
      critico: false, latitud: -25.3, longitud: -57.6, precisionM: 8, datos: JSON.stringify({ texto: 'llegamos' }),
    });
  });

  it('sin bombero vinculado usa el nombre de usuario', async () => {
    const e = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'MENSAJE', titulo: 'x', usuarioId: 'u2' });
    expect(e.usuarioNombre).toBe('central');
  });

  it('el reintento con la misma clave no duplica el evento', async () => {
    const a = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'EMERGENCIA', titulo: 'EMERGENCIA', claveIdempotencia: 'clave-12345' });
    const b = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'EMERGENCIA', titulo: 'EMERGENCIA', claveIdempotencia: 'clave-12345' });
    expect(b.id).toBe(a.id);
    expect(base.tabla('IncidenteEvento')).toHaveLength(1);
    expect(await cronologia.buscarPorClave(base as never, 's1', 'clave-12345')).toEqual(a);
  });

  it('recorta el título a 200 caracteres', async () => {
    const e = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'COMUNICACION', titulo: 'a'.repeat(250) });
    expect(e.titulo).toHaveLength(200);
  });
  it('acota la hora futura del dispositivo a la hora del servidor', async () => {
    const antes = new Date();
    const e = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'COMUNICACION', titulo: 'x', ocurridoEn: new Date('2999-01-01') });
    expect(e.ocurridoEn.getTime()).toBeGreaterThanOrEqual(antes.getTime());
    expect(e.ocurridoEn.getTime()).toBeLessThanOrEqual(e.registradoEn.getTime());
  });
});

describe('guardas compartidas', () => {
  let base: BaseFalsa;
  const motor = new MotorFases();
  beforeEach(async () => {
    base = new BaseFalsa();
    await sembrar(base, Servicio, { id: 's1', faseOperativa: 'DISPONIBLE', estado: 'EN_CURSO', resultado: null });
  });
  it.each(['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO'])('rechaza cierre con despacho %s, incluso resultado alternativo', async (estado) => {
    await sembrar(base, Despacho, { servicioId: 's1', estado });
    await expect(motor.fijar(base as never, await motor.bloquear(base as never, 's1'), 'CERRADO', new Date(), 'CANCELADO')).rejects.toThrow(ConflictException);
    expect(base.tabla('Servicio')[0].faseOperativa).toBe('DISPONIBLE');
  });
  it('rechaza cierre con persona dentro y no la libera', async () => {
    await sembrar(base, PersonalServicio, { servicioId: 's1', enZona: true });
    await expect(motor.validarCierre(base as never, 's1')).rejects.toThrow(/zona/);
    expect(base.tabla('PersonalServicio')[0].enZona).toBe(true);
  });
  it('no permite reabrir por fijar un incidente cerrado', async () => {
    base.tabla('Servicio')[0].faseOperativa = 'CERRADO';
    base.tabla('Servicio')[0].estado = 'FINALIZADO';
    await expect(motor.fijar(base as never, await motor.bloquear(base as never, 's1'), 'OPERANDO')).rejects.toThrow(ConflictException);
    expect(base.tabla('Servicio')[0].faseOperativa).toBe('CERRADO');
  });
  it('bloquea servicio primero y permite cierre con otros incidentes ocupados', async () => {
    await sembrar(base, PersonalServicio, { servicioId: 'otro', enZona: true });
    await sembrar(base, Despacho, { servicioId: 's1', estado: 'CERRADO' });
    const orden: string[] = [];
    const manager = { getRepository: (clase: new () => object) => {
      const repo = base.getRepository(clase);
      return { ...repo, findOne: jest.fn(async (opciones) => {
        orden.push(clase.name);
        if (clase === Servicio) expect(opciones.lock).toEqual({ mode: 'pessimistic_write' });
        return repo.findOne(opciones);
      }), find: jest.fn(async (opciones) => { orden.push(clase.name); return repo.find(opciones); }) };
    } };
    await motor.validarCierre(manager as never, 's1');
    expect(orden[0]).toBe('Servicio');
  });
});

describe('políticas institucionales persistidas', () => {
  let base: BaseFalsa;
  const politica = async (codigo: string, descripcion: string, extra = {}) => sembrar(base, Parametro, {
    tipo: 'POLITICA_INCIDENTE', codigo, descripcion, estado: 'ACTIVO', eliminadoEn: null, ...extra,
  });
  beforeEach(async () => {
    base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: 'b1' });
  });
  it.each(['MAS_CERCANA', 'HORA_INICIADA', 'HORAS_COMPLETAS'])('resuelve horas %s desde la base', async (valor) => {
    await politica('HORAS_SERVICIO', valor);
    expect(await politicaHoras(base as never)).toBe(valor);
  });
  it.each(['ausente', 'duplicada', 'desconocida', 'inactiva', 'eliminada'])('rechaza configuración %s', async (caso) => {
    if (caso !== 'ausente') await politica('HORAS_SERVICIO', caso === 'desconocida' ? 'OTRA' : 'MAS_CERCANA', {
      estado: caso === 'inactiva' ? 'INACTIVO' : 'ACTIVO', eliminadoEn: caso === 'eliminada' ? new Date() : null,
    });
    if (caso === 'duplicada') await politica('HORAS_SERVICIO', 'HORAS_COMPLETAS');
    await expect(politicaHoras(base as never)).rejects.toThrow(/política/i);
  });
  it('marca a quien no está asignado sin crear personal', async () => {
    await politica('PARTICIPACION', 'MARCAR_NO_ASIGNADO');
    expect(await validarParticipacion(base as never, 's1', 'u1')).toEqual({ fueraDeAsignacion: true });
    expect(base.tabla('PersonalServicio')).toHaveLength(0);
    await sembrar(base, PersonalServicio, { servicioId: 's1', bomberoId: 'b1' });
    expect(await validarParticipacion(base as never, 's1', 'u1')).toEqual({ fueraDeAsignacion: false });
  });
  it('admite participante vigente pero excluye retirado o finalizado', async () => {
    await politica('PARTICIPACION', 'SOLO_ASIGNADOS');
    await sembrar(base, ServicioParticipante, { servicioId: 's1', usuarioId: 'u1', estado: 'EN_CAMINO', hasta: null });
    expect(await validarParticipacion(base as never, 's1', 'u1')).toEqual({ fueraDeAsignacion: false });
    base.tabla('ServicioParticipante')[0].estado = 'RETIRADO';
    await expect(validarParticipacion(base as never, 's1', 'u1')).rejects.toThrow(ForbiddenException);
    base.tabla('ServicioParticipante')[0].estado = 'EN_CAMINO';
    base.tabla('ServicioParticipante')[0].hasta = new Date();
    await expect(validarParticipacion(base as never, 's1', 'u1')).rejects.toThrow(ForbiddenException);
  });
  it('no amplía permisos si falta configuración aunque esté asignado; emergencia nunca se bloquea', async () => {
    await sembrar(base, PersonalServicio, { servicioId: 's1', bomberoId: 'b1' });
    await expect(validarParticipacion(base as never, 's1', 'u1')).rejects.toThrow(/política/i);
    expect(await validarParticipacion(base as never, 's1', 'otro', true)).toEqual({ fueraDeAsignacion: true });
    await politica('PARTICIPACION', 'SOLO_ASIGNADOS');
    expect(await validarParticipacion(base as never, 's1', 'otro', true)).toEqual({ fueraDeAsignacion: true });
  });
  it.each(['desconocida', 'duplicada', 'inactiva', 'eliminada'])('participación inválida %s rechaza acciones pero permite emergencia', async (caso) => {
    await politica('PARTICIPACION', caso === 'desconocida' ? 'OTRA' : 'MARCAR_NO_ASIGNADO', {
      estado: caso === 'inactiva' ? 'INACTIVO' : 'ACTIVO', eliminadoEn: caso === 'eliminada' ? new Date() : null,
    });
    if (caso === 'duplicada') await politica('PARTICIPACION', 'SOLO_ASIGNADOS');
    await expect(validarParticipacion(base as never, 's1', 'u1')).rejects.toThrow(/política/i);
    expect(await validarParticipacion(base as never, 's1', 'u1', true)).toEqual({ fueraDeAsignacion: true });
  });
});

describe('idempotencia antes de efectos', () => {
  let base: BaseFalsa;
  const cronologia = new CronologiaService();
  const identidad = { servicioId: 's1', tipo: 'MOVIL_LLEGO' as const, usuarioId: 'u1', claveIdempotencia: 'clave', recurso: 'despacho:d1', entrada: { gps: { latitud: 1, longitud: 2 }, texto: 'llegada' } };
  beforeEach(() => { base = new BaseFalsa(); });
  const registrar = () => cronologia.registrar(base as never, {
    servicioId: identidad.servicioId, tipo: identidad.tipo, usuarioId: identidad.usuarioId, claveIdempotencia: identidad.claveIdempotencia,
    titulo: 'Llegada', idempotencia: { recurso: identidad.recurso, entrada: identidad.entrada },
  });
  it('canonicaliza claves anidadas y devuelve mismo evento antes de efectos', async () => {
    const original = await registrar();
    const previo = await cronologia.verificarIdempotencia(base as never, { ...identidad, entrada: { texto: 'llegada', gps: { longitud: 2, latitud: 1 } } });
    expect(previo?.id).toBe(original.id);
    expect(JSON.parse(original.datos!).__idempotencia).toBeDefined();
  });
  it.each([
    { usuarioId: 'u2' }, { tipo: 'MOVIL_SALIO' as const }, { recurso: 'despacho:d2' }, { entrada: { texto: 'diferente' } },
  ])('rechaza clave usada con distinta identidad %j', async (cambios) => {
    await registrar();
    await expect(cronologia.verificarIdempotencia(base as never, { ...identidad, ...cambios })).rejects.toThrow(ConflictException);
    expect(base.tabla('IncidenteEvento')).toHaveLength(1);
  });
  it('registrar también rechaza reutilización incompatible sin guardar', async () => {
    await registrar();
    await expect(cronologia.registrar(base as never, {
      servicioId: 's1', tipo: identidad.tipo, usuarioId: 'u2', titulo: 'Llegada', claveIdempotencia: 'clave',
      idempotencia: { recurso: identidad.recurso, entrada: identidad.entrada },
    })).rejects.toThrow(ConflictException);
    expect(base.tabla('IncidenteEvento')).toHaveLength(1);
  });
  it('clave se circunscribe al incidente y sin clave no busca reintento', async () => {
    await registrar();
    expect(await cronologia.verificarIdempotencia(base as never, { ...identidad, servicioId: 'otro' })).toBeNull();
    expect(await cronologia.verificarIdempotencia(base as never, { ...identidad, claveIdempotencia: null })).toBeNull();
  });
});

describe('MotorFases', () => {
  let base: BaseFalsa;
  const motor = new MotorFases();
  const servicio = () => base.tabla('Servicio')[0] as unknown as Servicio;

  beforeEach(async () => {
    base = new BaseFalsa();
    await sembrar(base, Servicio, { id: 's1', estado: 'REGISTRADO', faseOperativa: 'RECIBIDO', faseDesde: null, resultado: null });
  });

  it('avanza con un hecho y deriva el estado heredado', async () => {
    const cambio = await motor.alHecho(base as never, 's1', 'SALIDA', new Date('2026-10-07T14:34:00Z'));
    expect(cambio).toEqual({ antes: 'RECIBIDO', despues: 'EN_CAMINO' });
    expect(servicio()).toMatchObject({ faseOperativa: 'EN_CAMINO', estado: 'DESPACHADO', faseDesde: new Date('2026-10-07T14:34:00Z') });
  });

  it('un hecho que no avanza devuelve null y no toca nada', async () => {
    await motor.alHecho(base as never, 's1', 'LLEGADA');
    expect(await motor.alHecho(base as never, 's1', 'SALIDA')).toBeNull();
    expect(servicio().faseOperativa).toBe('EN_LUGAR');
  });

  it('mira los despachos para RETORNO y DISPONIBLE', async () => {
    await motor.alHecho(base as never, 's1', 'LLEGADA');
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', estado: 'REGRESANDO' });
    expect(await motor.alHecho(base as never, 's1', 'DESPACHOS_CAMBIARON')).toEqual({ antes: 'EN_LUGAR', despues: 'RETORNO' });
    (base.tabla('Despacho')[0] as Record<string, unknown>).estado = 'CERRADO';
    expect(await motor.alHecho(base as never, 's1', 'DESPACHOS_CAMBIARON')).toEqual({ antes: 'RETORNO', despues: 'DISPONIBLE' });
    expect(await motor.despachosActivos(base as never, 's1')).toEqual([]);
  });

  it('fijar con resultado CANCELADO en CERRADO deja el estado CANCELADO', async () => {
    const s = await motor.bloquear(base as never, 's1');
    await motor.fijar(base as never, s, 'CERRADO', new Date(), 'CANCELADO');
    expect(servicio()).toMatchObject({ faseOperativa: 'CERRADO', estado: 'CANCELADO', resultado: 'CANCELADO' });
  });

  it('un incidente inexistente es 404', async () => {
    await expect(motor.bloquear(base as never, 'no-existe')).rejects.toThrow(NotFoundException);
  });
});

it('la entidad de la bitácora existe en el índice', () => {
  expect(new IncidenteEvento()).toBeInstanceOf(IncidenteEvento);
});
