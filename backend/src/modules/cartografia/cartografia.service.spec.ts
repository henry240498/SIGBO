import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { CartografiaService } from './cartografia.service';
import { distanciaMetros, masCercanos } from './geo.util';

describe('geo.util', () => {
  it('distancia nula entre el mismo punto', () => {
    expect(distanciaMetros(-25.3, -57.6, -25.3, -57.6)).toBe(0);
  });

  it('un grado de latitud son ~111 km', () => {
    expect(distanciaMetros(0, 0, 1, 0)).toBeGreaterThan(111_000);
    expect(distanciaMetros(0, 0, 1, 0)).toBeLessThan(111_400);
  });

  it('es simetrica', () => {
    const a = distanciaMetros(-25.3, -57.6, -25.31, -57.62);
    const b = distanciaMetros(-25.31, -57.62, -25.3, -57.6);
    expect(a).toBeCloseTo(b, 6);
  });

  it('ordena por cercania, respeta el radio y el limite, y acepta texto numerico', () => {
    const items = [
      { id: 'lejos', latitud: -25.4, longitud: -57.6 },
      { id: 'cerca', latitud: '-25.3005', longitud: '-57.6' },
      { id: 'medio', latitud: -25.305, longitud: -57.6 },
    ];
    const r = masCercanos(items, -25.3, -57.6, 2000, 10);
    expect(r.map((i) => i.id)).toEqual(['cerca', 'medio']);
    expect(masCercanos(items, -25.3, -57.6, 2000, 1)).toHaveLength(1);
    expect(masCercanos(items, -25.3, -57.6, 10, 10)).toHaveLength(0);
  });
});

describe('CartografiaService', () => {
  let base: BaseFalsa;
  let auditoria: { registrar: jest.Mock };
  let servicio: CartografiaService;
  const ctx = { usuarioId: 'u1' };
  const hidrante = { codigo: 'H-001', direccion: 'Av. Principal 100', latitud: -25.3, longitud: -57.6 };
  const punto = { nombre: 'Deposito Norte', direccion: 'Ruta 1 km 5', latitud: -25.31, longitud: -57.61 };

  beforeEach(() => {
    base = new BaseFalsa();
    auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new CartografiaService(base as unknown as DataSource, auditoria as never);
  });

  describe('hidrantes', () => {
    it('se crea SIN_VERIFICAR por defecto, con coordenadas numericas y auditoria', async () => {
      const h = await servicio.crearHidrante(hidrante, ctx);
      expect(h).toMatchObject({ codigo: 'H-001', estado: 'SIN_VERIFICAR', activo: true, creadoPor: 'u1' });
      expect(typeof h.latitud).toBe('number');
      expect(auditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CREAR', recurso: 'servicios.hidrante' }));
    });

    it('no admite dos hidrantes con el mismo codigo', async () => {
      await servicio.crearHidrante(hidrante, ctx);
      await expect(servicio.crearHidrante(hidrante, ctx)).rejects.toThrow(ConflictException);
    });

    it('actualiza solo lo enviado y no toca el resto', async () => {
      const h = await servicio.crearHidrante({ ...hidrante, tipo: 'Columna' }, ctx);
      const a = await servicio.actualizarHidrante(h.id, { estado: 'OPERATIVO', caudalLpm: 600 }, ctx);
      expect(a).toMatchObject({ estado: 'OPERATIVO', caudalLpm: 600, tipo: 'Columna', direccion: 'Av. Principal 100' });
      await expect(servicio.actualizarHidrante('no-existe', { estado: 'OPERATIVO' }, ctx)).rejects.toThrow(NotFoundException);
    });

    it('dar de baja lo oculta del listado pero lo conserva, y queda auditado como BAJA', async () => {
      const h = await servicio.crearHidrante(hidrante, ctx);
      await servicio.actualizarHidrante(h.id, { activo: false }, ctx);
      expect(await servicio.listarHidrantes({})).toHaveLength(0);
      expect(await servicio.listarHidrantes({ incluirInactivos: true })).toHaveLength(1);
      expect(auditoria.registrar.mock.calls.at(-1)?.[0].accion).toBe('BAJA');
    });

    it('filtra por estado', async () => {
      const a = await servicio.crearHidrante(hidrante, ctx);
      await servicio.crearHidrante({ ...hidrante, codigo: 'H-002' }, ctx);
      await servicio.actualizarHidrante(a.id, { estado: 'OPERATIVO' }, ctx);
      expect((await servicio.listarHidrantes({ estado: 'OPERATIVO' })).map((x) => x.codigo)).toEqual(['H-001']);
    });
  });

  describe('puntos de riesgo y pre-planes', () => {
    it('nivel MEDIO por defecto; baja logica', async () => {
      const p = await servicio.crearPunto(punto, ctx);
      expect(p.nivelRiesgo).toBe('MEDIO');
      await servicio.actualizarPunto(p.id, { nivelRiesgo: 'CRITICO' }, ctx);
      expect((await servicio.listarPuntos({}))[0].nivelRiesgo).toBe('CRITICO');
      await servicio.actualizarPunto(p.id, { activo: false }, ctx);
      expect(await servicio.listarPuntos({})).toHaveLength(0);
    });

    it('sin pre-plan devuelve null; cada edicion crea una version nueva y solo una es vigente', async () => {
      const p = await servicio.crearPunto(punto, ctx);
      expect(await servicio.preplanVigente(p.id)).toBeNull();

      const v1 = await servicio.guardarPreplan(p.id, { titulo: 'Plan A', contenido: 'Acceso por el portón norte' }, ctx);
      const v2 = await servicio.guardarPreplan(p.id, { titulo: 'Plan A', contenido: 'Acceso por el portón sur' }, ctx);
      expect([v1.version, v2.version]).toEqual([1, 2]);

      const vigente = await servicio.preplanVigente(p.id);
      expect(vigente?.version).toBe(2);
      const historial = await servicio.historialPreplan(p.id);
      expect(historial.map((x) => [x.version, x.vigente])).toEqual([[2, true], [1, false]]);
      // la version vieja conserva su contenido original
      expect(historial[1].contenido).toBe('Acceso por el portón norte');
    });

    it('rechaza guardar un pre-plan identico al vigente y uno de un punto dado de baja o inexistente', async () => {
      const p = await servicio.crearPunto(punto, ctx);
      await servicio.guardarPreplan(p.id, { titulo: 'Plan', contenido: 'Contenido' }, ctx);
      await expect(servicio.guardarPreplan(p.id, { titulo: 'Plan', contenido: 'Contenido' }, ctx)).rejects.toThrow(BadRequestException);
      await servicio.actualizarPunto(p.id, { activo: false }, ctx);
      await expect(servicio.guardarPreplan(p.id, { titulo: 'Otro', contenido: 'Otro' }, ctx)).rejects.toThrow(ConflictException);
      await expect(servicio.preplanVigente('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cercanos', () => {
    it('devuelve lo cercano ordenado, sin lo dado de baja', async () => {
      const cerca = await servicio.crearHidrante({ ...hidrante, codigo: 'CERCA', latitud: -25.3005 }, ctx);
      await servicio.crearHidrante({ ...hidrante, codigo: 'LEJOS', latitud: -25.5 }, ctx);
      const baja = await servicio.crearHidrante({ ...hidrante, codigo: 'BAJA', latitud: -25.3001 }, ctx);
      await servicio.actualizarHidrante(baja.id, { activo: false }, ctx);
      await servicio.crearPunto({ ...punto, latitud: -25.301, longitud: -57.6 }, ctx);

      const r = await servicio.cercanos(-25.3, -57.6, 1000);
      expect(r.hidrantes.map((h) => h.codigo)).toEqual(['CERCA']);
      expect(r.hidrantes[0].id).toBe(cerca.id);
      expect(r.hidrantes[0].distanciaM).toBeGreaterThan(0);
      expect(r.puntosRiesgo).toHaveLength(1);
    });
  });
});
