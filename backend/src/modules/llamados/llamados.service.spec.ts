import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Servicio, TipoServicio } from '../../shared/entities';
import { LlamadosService } from './llamados.service';

type Clase = { new (): object; name: string };
type Fila = Record<string, unknown>;

/** Base en memoria con la interfaz de Repository que usa LlamadosService. */
class BaseFalsa {
  tablas = new Map<string, Fila[]>();
  private secuencia = 0;
  /** Reloj de prueba: cada escritura avanza un segundo para ordenar de forma estable. */
  private reloj = Date.parse('2026-01-01T00:00:00Z');

  tabla(nombre: string) {
    if (!this.tablas.has(nombre)) this.tablas.set(nombre, []);
    return this.tablas.get(nombre)!;
  }

  private coincide(fila: Fila, where: Fila) {
    return Object.entries(where).every(([k, v]) => fila[k] === v);
  }

  /** Como DataSource.transaction: aqui todo es secuencial, asi que el "manager" es la propia base. */
  transaction = async <T>(cb: (m: BaseFalsa) => Promise<T>): Promise<T> => cb(this);

  getRepository = (clase: Clase) => ({
    create: (d: Fila) => Object.assign(new clase(), d),
    findOne: async ({ where }: { where: Fila }) => this.tabla(clase.name).find((f) => this.coincide(f, where)) ?? null,
    find: async (o: { where?: Fila; order?: Record<string, 'ASC' | 'DESC'>; take?: number } = {}) => {
      let filas = this.tabla(clase.name).filter((f) => this.coincide(f, o.where ?? {}));
      const [campo, sentido] = Object.entries(o.order ?? {})[0] ?? [];
      if (campo) {
        filas = [...filas].sort((a, b) => (Number(a[campo]) - Number(b[campo])) * (sentido === 'DESC' ? -1 : 1));
      }
      return o.take ? filas.slice(0, o.take) : filas;
    },
    save: async (e: Fila) => {
      const tabla = this.tabla(clase.name);
      if (!e.id) e.id = `id-${++this.secuencia}`;
      if (e.creadoEn === undefined) e.creadoEn = new Date((this.reloj += 1000));
      if (!tabla.includes(e)) tabla.push(e);
      return e;
    },
  });
}

describe('LlamadosService', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: LlamadosService;
  const operador = { usuarioId: 'op1', username: 'radio' };
  const bombero = (n: number) => ({ usuarioId: `b${n}`, username: `bombero${n}` });

  const llamadoBase = { medio: 'Radio', direccion: 'Av. Principal 123' };

  beforeEach(() => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new LlamadosService(base as unknown as DataSource, auditoria as never);
  });

  describe('llamados', () => {
    it('registra el llamado como RECIBIDO, con quien lo recibio, y lo audita', async () => {
      const l = await servicio.crearLlamado({ ...llamadoBase, llamanteNombre: 'Ana' }, operador);
      expect(l).toMatchObject({ estado: 'RECIBIDO', recibidoPor: 'op1', medio: 'Radio', llamanteNombre: 'Ana', servicioId: null });
      expect(l.recibidoEn).toBeInstanceOf(Date);
      expect(auditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CREAR', recurso: 'servicios.llamado', usuarioId: 'op1' }));
    });

    it('reintentar el mismo envio (misma clave) no crea un llamado repetido y conserva la hora real', async () => {
      const hora = new Date(Date.now() - 10 * 60_000).toISOString();
      const a = await servicio.crearLlamado({ ...llamadoBase, claveIdempotencia: 'clave-12345', ocurridoEn: hora }, operador);
      const b = await servicio.crearLlamado({ ...llamadoBase, claveIdempotencia: 'clave-12345', ocurridoEn: hora }, operador);
      expect(b.id).toBe(a.id);
      expect(new Date(a.recibidoEn).toISOString()).toBe(hora);
      expect(base.tabla('Llamado')).toHaveLength(1);
      await servicio.crearLlamado({ ...llamadoBase, claveIdempotencia: 'otra-clave-99' }, operador);
      expect(base.tabla('Llamado')).toHaveLength(2);
    });

    it('rechaza un tipo de servicio inexistente y acepta uno existente', async () => {
      await expect(servicio.crearLlamado({ ...llamadoBase, tipoServicioId: 'T9' }, operador)).rejects.toThrow(BadRequestException);
      base.getRepository(TipoServicio as never).save({ id: 'T1' });
      await expect(servicio.crearLlamado({ ...llamadoBase, tipoServicioId: 'T1' }, operador)).resolves.toBeDefined();
    });

    it('avanza RECIBIDO -> EN_ATENCION -> CERRADO y no se reabre', async () => {
      const l = await servicio.crearLlamado(llamadoBase, operador);
      expect((await servicio.cambiarEstadoLlamado(l.id, { estado: 'EN_ATENCION' }, operador)).estado).toBe('EN_ATENCION');
      const cerrado = await servicio.cambiarEstadoLlamado(l.id, { estado: 'CERRADO' }, operador);
      expect(cerrado).toMatchObject({ estado: 'CERRADO', cerradoPor: 'op1' });
      expect(cerrado.cerradoEn).toBeInstanceOf(Date);
      await expect(servicio.cambiarEstadoLlamado(l.id, { estado: 'EN_ATENCION' }, operador)).rejects.toThrow(ConflictException);
    });

    it('cerrar un llamado que nunca se atendio exige motivo', async () => {
      const l = await servicio.crearLlamado(llamadoBase, operador);
      await expect(servicio.cambiarEstadoLlamado(l.id, { estado: 'CERRADO' }, operador)).rejects.toThrow(BadRequestException);
      const ok = await servicio.cambiarEstadoLlamado(l.id, { estado: 'CERRADO', motivo: 'Falsa alarma' }, operador);
      expect(ok.motivoCierre).toBe('Falsa alarma');
    });

    it('no existe: 404', async () => {
      await expect(servicio.obtenerLlamado('nada')).rejects.toThrow(NotFoundException);
    });

    it('vincular un servicio pasa el llamado a EN_ATENCION; exige servicio real y llamado abierto', async () => {
      const l = await servicio.crearLlamado(llamadoBase, operador);
      await expect(servicio.vincularServicio(l.id, 'S9', operador)).rejects.toThrow(NotFoundException);
      base.getRepository(Servicio as never).save({ id: 'S1' });
      const v = await servicio.vincularServicio(l.id, 'S1', operador);
      expect(v).toMatchObject({ servicioId: 'S1', estado: 'EN_ATENCION' });
      await servicio.cambiarEstadoLlamado(l.id, { estado: 'CERRADO' }, operador);
      await expect(servicio.vincularServicio(l.id, 'S1', operador)).rejects.toThrow(ConflictException);
    });

    it('lista del mas reciente al mas viejo y filtra por estado', async () => {
      const a = await servicio.crearLlamado(llamadoBase, operador);
      const b = await servicio.crearLlamado(llamadoBase, operador);
      // el orden usa recibidoEn: se fuerza para no depender del reloj real
      (a as { recibidoEn: Date }).recibidoEn = new Date('2026-01-01T10:00:00Z');
      (b as { recibidoEn: Date }).recibidoEn = new Date('2026-01-01T11:00:00Z');
      await servicio.cambiarEstadoLlamado(a.id, { estado: 'CERRADO', motivo: 'x' }, operador);
      expect((await servicio.listarLlamados({})).map((x) => x.id)).toEqual([b.id, a.id]);
      expect((await servicio.listarLlamados({ estado: 'RECIBIDO' })).map((x) => x.id)).toEqual([b.id]);
    });
  });

  describe('convocatorias', () => {
    it('crea una convocatoria ABIERTA y la audita', async () => {
      const c = await servicio.crearConvocatoria({ mensaje: 'Incendio en Av. Principal' }, operador);
      expect(c).toMatchObject({ estado: 'ABIERTA', creadaPor: 'op1', mensaje: 'Incendio en Av. Principal' });
      expect(auditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CREAR', recurso: 'servicios.convocatoria' }));
    });

    it('exige que el llamado o servicio asociados existan', async () => {
      await expect(servicio.crearConvocatoria({ mensaje: 'Hola', llamadoId: 'L9' }, operador)).rejects.toThrow(NotFoundException);
      await expect(servicio.crearConvocatoria({ mensaje: 'Hola', servicioId: 'S9' }, operador)).rejects.toThrow(NotFoundException);
    });

    it('cada bombero responde una vez; contestar de nuevo reemplaza (no duplica)', async () => {
      const c = await servicio.crearConvocatoria({ mensaje: 'Convocatoria' }, operador);
      await servicio.responder(c.id, { respuesta: 'VOY', etaMinutos: 10 }, bombero(1));
      await servicio.responder(c.id, { respuesta: 'VOY', etaMinutos: 5 }, bombero(1));
      await servicio.responder(c.id, { respuesta: 'NO_PUEDO' }, bombero(2));
      const d = await servicio.detalleConvocatoria(c.id);
      expect(d.respuestas).toHaveLength(2);
      expect(d.totales).toEqual({ voy: 1, noPuedo: 1 });
      expect(d.respuestas.find((r) => r.usuarioId === 'b1')).toMatchObject({ respuesta: 'VOY', etaMinutos: 5 });
      expect(auditoria.registrar.mock.calls.map(([a]) => a.accion)).toEqual(['CREAR', 'RESPONDER', 'CAMBIAR_RESPUESTA', 'RESPONDER']);
    });

    it('cambiar de VOY a NO_PUEDO borra el tiempo de llegada', async () => {
      const c = await servicio.crearConvocatoria({ mensaje: 'Convocatoria' }, operador);
      await servicio.responder(c.id, { respuesta: 'VOY', etaMinutos: 15 }, bombero(1));
      const r = await servicio.responder(c.id, { respuesta: 'NO_PUEDO' }, bombero(1));
      expect(r).toEqual({ respuesta: 'NO_PUEDO', etaMinutos: null });
    });

    it('rechaza un tiempo de llegada en una respuesta NO_PUEDO', async () => {
      const c = await servicio.crearConvocatoria({ mensaje: 'Convocatoria' }, operador);
      await expect(servicio.responder(c.id, { respuesta: 'NO_PUEDO', etaMinutos: 5 }, bombero(1))).rejects.toThrow(BadRequestException);
    });

    it('no se puede responder una convocatoria cerrada ni cerrarla dos veces', async () => {
      const c = await servicio.crearConvocatoria({ mensaje: 'Convocatoria' }, operador);
      const cerrada = await servicio.cerrarConvocatoria(c.id, operador);
      expect(cerrada).toMatchObject({ estado: 'CERRADA', cerradaPor: 'op1' });
      await expect(servicio.responder(c.id, { respuesta: 'VOY' }, bombero(1))).rejects.toThrow(ConflictException);
      await expect(servicio.cerrarConvocatoria(c.id, operador)).rejects.toThrow(ConflictException);
      await expect(servicio.responder('nada', { respuesta: 'VOY' }, bombero(1))).rejects.toThrow(NotFoundException);
    });

    it('las abiertas muestran a cada usuario SOLO su propia respuesta y omiten las cerradas', async () => {
      const a = await servicio.crearConvocatoria({ mensaje: 'Primera' }, operador);
      const b = await servicio.crearConvocatoria({ mensaje: 'Segunda' }, operador);
      await servicio.responder(a.id, { respuesta: 'VOY', etaMinutos: 7 }, bombero(1));
      await servicio.responder(a.id, { respuesta: 'NO_PUEDO' }, bombero(2));
      await servicio.cerrarConvocatoria(b.id, operador);

      const para1 = await servicio.abiertasPara('b1');
      expect(para1).toHaveLength(1);
      expect(para1[0]).toMatchObject({ id: a.id, miRespuesta: { respuesta: 'VOY', etaMinutos: 7 } });
      expect((await servicio.abiertasPara('b2'))[0].miRespuesta).toMatchObject({ respuesta: 'NO_PUEDO', etaMinutos: null });
      expect((await servicio.abiertasPara('b3'))[0].miRespuesta).toBeNull();
      // la vista para la app no filtra las respuestas de otros
      expect(JSON.stringify(para1)).not.toContain('bombero2');
    });
  });
});
