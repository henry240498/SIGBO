import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Despacho,
  HistorialServicio,
  MovilEstadoHistorial,
  PosicionMovil,
  Servicio,
  Vehiculo,
} from '../../shared/entities';
import { FlotaService } from './flota.service';

type Clase = { new (): object; name: string };

/**
 * Base en memoria con la misma interfaz que usa FlotaService (EntityManager y
 * Repository). Permite verificar la maquina de estados del despacho sin SQL
 * Server, igual que el resto de las pruebas del backend.
 */
class BaseFalsa {
  tablas = new Map<string, Array<Record<string, unknown>>>();
  private secuencia = 0;

  tabla(nombre: string) {
    if (!this.tablas.has(nombre)) this.tablas.set(nombre, []);
    return this.tablas.get(nombre)!;
  }

  private coincide(fila: Record<string, unknown>, where: Record<string, unknown> | Array<Record<string, unknown>>) {
    const condiciones = Array.isArray(where) ? where : [where];
    return condiciones.some((c) => Object.entries(c).every(([k, v]) => fila[k] === v));
  }

  create = (clase: Clase, datos: Record<string, unknown>) => Object.assign(new clase(), datos);

  findOne = async (clase: Clase, opciones: { where: Record<string, unknown> | Array<Record<string, unknown>> }) =>
    this.tabla(clase.name).find((f) => this.coincide(f, opciones.where)) ?? null;

  /** Como TypeORM: guardar una entidad con clave primaria existente la reemplaza. */
  save = async (entidad: Record<string, unknown>) => {
    const nombre = entidad.constructor.name;
    const tabla = this.tabla(nombre);
    const pk = nombre === 'PosicionMovil' ? 'vehiculoId' : 'id';
    if (pk === 'id' && !entidad.id) entidad.id = `id-${++this.secuencia}`;
    const indice = tabla.findIndex((f) => f[pk] === entidad[pk]);
    if (indice >= 0) tabla[indice] = entidad;
    else tabla.push(entidad);
    return entidad;
  };

  transaction = async <T>(cb: (m: BaseFalsa) => Promise<T>) => cb(this);

  get manager() {
    return this;
  }

  getRepository = (clase: Clase) => ({
    findOne: (o: { where: Record<string, unknown> }) => this.findOne(clase, o),
    save: this.save,
    create: (d: Record<string, unknown>) => this.create(clase, d),
  });
}

describe('FlotaService', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: FlotaService;
  const ctx = { usuarioId: 'u1' };

  const sembrarServicio = (extra: Record<string, unknown> = {}) =>
    base.save(Object.assign(new Servicio(), { id: 'S1', estado: 'REGISTRADO', fechaHoraSalida: null, fechaHoraLlegada: null, ...extra }) as never);
  const sembrarVehiculo = (extra: Record<string, unknown> = {}) =>
    base.save(Object.assign(new Vehiculo(), { id: 'V1', numeroInterno: '10', estado: 'OPERATIVO', estadoOperativo: 'EN_CUARTEL', estadoOperativoDesde: null, ...extra }) as never);

  const estadosMovil = () => base.tabla('MovilEstadoHistorial').map((h) => h.estadoNuevo);
  const eventos = () => base.tabla('HistorialServicio').map((h) => h.tipoEvento);
  const vehiculo = () => base.tabla('Vehiculo')[0] as unknown as Vehiculo;
  const svc = () => base.tabla('Servicio')[0] as unknown as Servicio;

  beforeEach(async () => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new FlotaService(base as unknown as DataSource, auditoria as never);
    await sembrarServicio();
    await sembrarVehiculo();
  });

  it('recorre el ciclo completo: despacho, llegada, fin y regreso', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    expect(d.estado).toBe('DESPACHADO');
    expect(vehiculo().estadoOperativo).toBe('DESPACHADO');
    expect(svc().estado).toBe('DESPACHADO');
    expect(svc().fechaHoraSalida).toBeInstanceOf(Date);

    const llegada = await servicio.avanzar(d.id, 'llegada', ctx);
    expect(llegada.estado).toBe('EN_SERVICIO');
    expect(svc().estado).toBe('EN_CURSO');
    expect(svc().fechaHoraLlegada).toBeInstanceOf(Date);
    expect(llegada.tiempoRespuestaSegundos).not.toBeNull();

    expect((await servicio.avanzar(d.id, 'fin', ctx)).estado).toBe('REGRESANDO');
    const cierre = await servicio.avanzar(d.id, 'regreso', ctx);
    expect(cierre.estado).toBe('CERRADO');
    expect(cierre.tiempoRegresoSegundos).not.toBeNull();

    expect(vehiculo().estadoOperativo).toBe('EN_CUARTEL');
    expect(estadosMovil()).toEqual(['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO', 'EN_CUARTEL']);
    expect(eventos()).toEqual(['SALIDA_CUARTEL', 'LLEGADA_SERVICIO', 'SALIDA_SERVICIO', 'REGRESO_CUARTEL']);
    // el servicio NO se finaliza solo: es decision del mando
    expect(svc().estado).toBe('EN_CURSO');
  });

  it('audita cada accion con el usuario que la hizo', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await servicio.avanzar(d.id, 'llegada', ctx);
    expect(auditoria.registrar.mock.calls.map(([a]) => a.accion)).toEqual(['DESPACHAR', 'LLEGADA']);
    expect(auditoria.registrar.mock.calls.every(([a]) => a.usuarioId === 'u1')).toBe(true);
  });

  it('no despacha un movil fuera de servicio ni uno que ya salio', async () => {
    vehiculo().estado = 'EN_MANTENIMIENTO';
    await expect(servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx)).rejects.toThrow(ConflictException);
    vehiculo().estado = 'OPERATIVO';
    await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await expect(servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx)).rejects.toThrow(/debe estar EN_CUARTEL/);
  });

  it('no despacha a un servicio finalizado, cancelado o inexistente', async () => {
    svc().estado = 'FINALIZADO';
    await expect(servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx)).rejects.toThrow(ConflictException);
    await expect(servicio.despachar({ servicioId: 'NO', vehiculoId: 'V1' }, ctx)).rejects.toThrow(NotFoundException);
    await expect(servicio.despachar({ servicioId: 'S1', vehiculoId: 'NO' }, ctx)).rejects.toThrow();
    expect(base.tabla('Despacho')).toHaveLength(0);
  });

  it('no permite saltear pasos ni repetirlos', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await expect(servicio.avanzar(d.id, 'fin', ctx)).rejects.toThrow(ConflictException);
    await expect(servicio.avanzar(d.id, 'regreso', ctx)).rejects.toThrow(ConflictException);
    await servicio.avanzar(d.id, 'llegada', ctx);
    await expect(servicio.avanzar(d.id, 'llegada', ctx)).rejects.toThrow(ConflictException);
  });

  it('cancelar exige motivo, libera el movil y deja rastro', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await expect(servicio.cancelar(d.id, '   ', ctx)).rejects.toThrow(BadRequestException);
    const cancelado = await servicio.cancelar(d.id, 'Falsa alarma', ctx);
    expect(cancelado.estado).toBe('CANCELADO');
    expect(cancelado.motivoCancelacion).toBe('Falsa alarma');
    expect(vehiculo().estadoOperativo).toBe('EN_CUARTEL');
    await expect(servicio.cancelar(d.id, 'otra vez', ctx)).rejects.toThrow(ConflictException);
    expect(base.tabla('MovilEstadoHistorial').at(-1)?.motivo).toContain('Falsa alarma');
  });

  it('reponer en cuartel exige motivo y cierra el despacho activo', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await expect(servicio.reponerEnCuartel('V1', '', ctx)).rejects.toThrow(BadRequestException);
    await servicio.reponerEnCuartel('V1', 'El celular se apago', ctx);
    expect(vehiculo().estadoOperativo).toBe('EN_CUARTEL');
    expect((base.tabla('Despacho')[0] as unknown as Despacho).estado).toBe('CANCELADO');
    expect(d.id).toBe(base.tabla('Despacho')[0].id);
    expect(auditoria.registrar.mock.calls.at(-1)?.[0].accion).toBe('REPONER_EN_CUARTEL');
  });

  it('traduce la violacion del indice unico en un conflicto claro', async () => {
    const original = base.save;
    let primera = true;
    base.save = async (e: Record<string, unknown>) => {
      if (e.constructor === Despacho && primera) {
        primera = false;
        throw Object.assign(new Error('duplicado'), { number: 2601 });
      }
      return original(e);
    };
    await expect(servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx)).rejects.toThrow(/ya tiene un despacho activo/);
  });

  describe('despacho idempotente (id generado por la app)', () => {
    const ID = '33333333-3333-4333-8333-333333333333';

    it('el mismo id reintentado devuelve el mismo despacho sin repetir efectos', async () => {
      const a = await servicio.despachar({ id: ID, servicioId: 'S1', vehiculoId: 'V1' }, ctx);
      const b = await servicio.despachar({ id: ID, servicioId: 'S1', vehiculoId: 'V1' }, ctx);
      expect(a.id).toBe(ID);
      expect(b.id).toBe(ID);
      expect(base.tabla('Despacho')).toHaveLength(1);
      expect(base.tabla('MovilEstadoHistorial')).toHaveLength(1);
      expect(auditoria.registrar).toHaveBeenCalledTimes(1);
    });

    it('permite encadenar los pasos siguientes con ese id', async () => {
      await servicio.despachar({ id: ID, servicioId: 'S1', vehiculoId: 'V1' }, ctx);
      expect((await servicio.avanzar(ID, 'llegada', ctx)).estado).toBe('EN_SERVICIO');
    });

    it('el mismo id para otro movil o servicio se rechaza', async () => {
      await servicio.despachar({ id: ID, servicioId: 'S1', vehiculoId: 'V1' }, ctx);
      await expect(servicio.despachar({ id: ID, servicioId: 'S1', vehiculoId: 'V2' }, ctx)).rejects.toThrow(/ya se uso/);
    });
  });

  describe('hechos registrados sin conexion', () => {
    it('usa la hora real del hecho y nunca deja un hito antes del anterior', async () => {
      const base0 = Date.now();
      const hace = (min: number) => new Date(base0 - min * 60_000).toISOString();
      const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1', ocurridoEn: hace(30) }, ctx);
      expect(new Date(d.horaSalida).toISOString()).toBe(hace(30));
      const llegada = await servicio.avanzar(d.id, 'llegada', ctx, { ocurridoEn: hace(20) });
      expect(new Date(llegada.horaLlegada!).toISOString()).toBe(hace(20));
      expect(llegada.tiempoRespuestaSegundos).toBe(600);
      // reloj del celular atrasado: la salida no puede quedar antes de la llegada
      const fin = await servicio.avanzar(d.id, 'fin', ctx, { ocurridoEn: hace(60) });
      expect(new Date(fin.horaFin!).getTime()).toBeGreaterThanOrEqual(new Date(llegada.horaLlegada!).getTime());
    });

    it('una hora futura se reemplaza por la del servidor', async () => {
      const futuro = new Date(Date.now() + 3_600_000).toISOString();
      const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1', ocurridoEn: futuro }, ctx);
      expect(new Date(d.horaSalida).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('posicion', () => {
    it('guarda la primera lectura y descarta una mas vieja', async () => {
      const t = new Date('2026-01-01T10:00:00Z');
      const dto = { latitud: -25.3, longitud: -57.6 };
      expect(await servicio.reportarPosicion('V1', { ...dto, registradoEn: t.toISOString() }, 'u1')).toEqual({ guardada: true });
      const vieja = new Date('2026-01-01T09:00:00Z').toISOString();
      expect(await servicio.reportarPosicion('V1', { ...dto, latitud: -1, registradoEn: vieja }, 'u1')).toEqual({ guardada: false });
      expect((base.tabla('PosicionMovil')[0] as unknown as PosicionMovil).latitud).toBe(-25.3);
      const nueva = new Date('2026-01-01T11:00:00Z').toISOString();
      expect(await servicio.reportarPosicion('V1', { ...dto, latitud: -26, registradoEn: nueva }, 'u1')).toEqual({ guardada: true });
      expect(base.tabla('PosicionMovil')).toHaveLength(1);
      expect((base.tabla('PosicionMovil')[0] as unknown as PosicionMovil).latitud).toBe(-26);
    });

    it('un reloj adelantado no congela el mapa: la hora se acota a la del servidor', async () => {
      const futuro = new Date(Date.now() + 3600_000).toISOString();
      await servicio.reportarPosicion('V1', { latitud: 1, longitud: 1, registradoEn: futuro }, 'u1');
      const guardada = base.tabla('PosicionMovil')[0] as unknown as PosicionMovil;
      expect(new Date(guardada.registradoEn).getTime()).toBeLessThanOrEqual(Date.now());
      // una lectura posterior legitima se acepta
      await new Promise((r) => setTimeout(r, 5));
      expect(await servicio.reportarPosicion('V1', { latitud: 2, longitud: 2 }, 'u1')).toEqual({ guardada: true });
    });

    it('no acepta posicion de un movil inexistente', async () => {
      await expect(servicio.reportarPosicion('NO', { latitud: 1, longitud: 1 }, 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});

// Evita que el linter marque entidades importadas solo por el nombre de su clase.
void [HistorialServicio, MovilEstadoHistorial];
