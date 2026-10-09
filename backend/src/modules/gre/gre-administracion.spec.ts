import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { GreAdminController } from './gre-admin.controller';
import { GreComparacionService } from './gre-comparacion.service';
import { huellaSolicitud, resultadoPrevio } from './gre-idempotencia';
import { GreImportacionService, identidadParser } from './gre-importacion.service';
import { GreRevisionService } from './gre-revision.service';
import { GreTrabajadorService } from './gre-trabajador.service';

describe('Administración GRE: controles de edición y autoridad', () => {
  const actor = randomUUID();
  const versionId = randomUUID();
  const ctx = { usuarioId: actor };

  it('una actualización de PyMuPDF tiene otra identidad aunque conserve parser y PDF', () => {
    expect(identidadParser('catalogo-1', '1.28.2')).not.toBe(identidadParser('catalogo-1', '1.29.0'));
  });

  it.each([
    ['solicitar', 'matpel:administrar_gre', 'matpel:validar_gre'],
    ['revisar', 'matpel:validar_gre', 'matpel:administrar_gre'],
    ['validar', 'matpel:validar_gre', 'matpel:activar_gre'],
    ['activar', 'matpel:activar_gre', 'matpel:validar_gre'],
  ])('%s exige su permiso propio sin inferir autoridad de otra capacidad', (metodo, permitido, ajeno) => {
    const guard = new PermissionsGuard(new Reflector());
    const contexto = (permisos: string[]) => ({
      getHandler: () => (GreAdminController.prototype as any)[metodo], getClass: () => GreAdminController,
      switchToHttp: () => ({ getRequest: () => ({ user: { id: actor, permisos } }) }),
    });
    expect(guard.canActivate(contexto([permitido]) as any)).toBe(true);
    expect(() => guard.canActivate(contexto([ajeno]) as any)).toThrow(/Permiso insuficiente/);
    expect(() => guard.canActivate(contexto([]) as any)).toThrow(/Permiso insuficiente/);
  });

  it('un reintento conserva su resultado y rechaza otro contenido o actor', async () => {
    const huella = huellaSolicitud({ versionId, fundamento: 'Fuente cotejada' });
    expect(huellaSolicitud({ fundamento: 'Fuente cotejada', versionId: versionId.toUpperCase() })).toBe(huella);
    const m = { query: jest.fn().mockResolvedValue([{ usuario_id: actor.toUpperCase(), metadata: JSON.stringify({
      huellaSolicitud: huella, resultadoSolicitud: { cambiadas: 3 },
    }) }]) };
    expect(await resultadoPrevio(m as any, 'GRE_REVISION_REGISTRADA', randomUUID(), actor, huella)).toEqual({ cambiadas: 3 });
    await expect(resultadoPrevio(m as any, 'GRE_REVISION_REGISTRADA', randomUUID(), actor, 'otra'))
      .rejects.toMatchObject({ response: { codigo: 'IDEMPOTENCIA_EN_CONFLICTO' } });
    await expect(resultadoPrevio(m as any, 'GRE_REVISION_REGISTRADA', randomUUID(), randomUUID(), huella))
      .rejects.toMatchObject({ status: 409 });
  });

  it('un trabajador vencido no marca ERROR el candidato de otro trabajador', async () => {
    const m = { query: jest.fn().mockResolvedValue([]) };
    const ds = { transaction: jest.fn((fn) => fn(m)) };
    const auditoria = { registrar: jest.fn() };
    const servicio = new GreImportacionService(ds as any, {} as any, auditoria as any, '.');
    await (servicio as any).fallar({ id: randomUUID(), versionId, token: randomUUID(), intento: 1 }, new Error('lease perdido'));
    expect(m.query).toHaveBeenCalledTimes(1);
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('un fallo propio se registra con auditoría en la misma transacción', async () => {
    const m = { query: jest.fn().mockResolvedValueOnce([{ id: 'trabajo' }]).mockResolvedValue([]) };
    const ds = { transaction: jest.fn((fn) => fn(m)) };
    const auditoria = { registrar: jest.fn() };
    const servicio = new GreImportacionService(ds as any, {} as any, auditoria as any, '.');
    await (servicio as any).fallar({ id: randomUUID(), versionId, token: randomUUID(), intento: 1 }, new Error('artefacto corrupto'));
    expect(m.query).toHaveBeenCalledTimes(2);
    expect(auditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'GRE_IMPORTACION_FALLIDA' }), m);
  });

  it.each([
    ['sin reporte', null, 10, 10, 0],
    ['sin contenido', JSON.stringify({ hallazgos: [] }), 0, 0, 0],
    ['con notas sin cotejar', JSON.stringify({ hallazgos: [] }), 10, 9, 0],
    ['con celda no interpretada', JSON.stringify({ hallazgos: [] }), 10, 10, 1],
    ['con hallazgo crítico', JSON.stringify({ hallazgos: [{ codigo: 'CRITICO' }] }), 10, 10, 0],
  ])('no permite validar un candidato %s', async (_, reporteJson, total, verificadas, incompletas) => {
    const m = { getRepository: () => ({ findOneBy: jest.fn().mockResolvedValue({ estado: 'REQUIERE_REVISION', reporteJson }) }),
      query: jest.fn().mockResolvedValueOnce([{ codigo: 'TABLA_1', pagina: 298, filas: total ? 1 : 0, verificadas: 1, rechazadas: 0 }])
        .mockResolvedValueOnce([{ total, verificadas, rechazadas: 0 }]).mockResolvedValueOnce([{ total: incompletas }])
        .mockResolvedValueOnce(['TABLA_1', 'TABLA_2', 'TABLA_3'].map((codigo) => ({ codigo, filas: 1 }))),
    };
    const servicio = new GreRevisionService({ manager: m } as any, {} as any);
    expect((await servicio.progreso(versionId)).validable).toBe(false);
  });

  it('no valida un catálogo con referencias cotejadas al que le falta una tabla', async () => {
    const m = { getRepository: () => ({ findOneBy: jest.fn().mockResolvedValue({
      estado: 'REQUIERE_REVISION', reporteJson: JSON.stringify({ hallazgos: [] }),
    }) }), query: jest.fn().mockResolvedValueOnce([{ codigo: 'TABLA_1', filas: 1, verificadas: 1, rechazadas: 0 }])
      .mockResolvedValueOnce([{ total: 1, verificadas: 1, rechazadas: 0 }]).mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([{ codigo: 'TABLA_1', filas: 1 }]),
    };
    const progreso = await new GreRevisionService({ manager: m } as any, {} as any).progreso(versionId);
    expect(progreso.validable).toBe(false);
    expect(progreso.motivos).toContain('Falta contenido en alguna de las tres tablas requeridas.');
  });

  it('rechaza revisar un lote que incluye referencias de otra versión sin registrar cambios', async () => {
    const m = { query: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([{ estado: 'REQUIERE_REVISION' }])
      .mockResolvedValueOnce([{ total: 1 }]) };
    const auditoria = { registrar: jest.fn() };
    const servicio = new GreRevisionService({ transaction: (fn: any) => fn(m) } as any, auditoria as any);
    await expect(servicio.registrar(versionId, { referenciaIds: [randomUUID(), randomUUID()] }, 'VERIFICADO',
      'Cotejo de un lote completo', null, randomUUID(), ctx)).rejects.toMatchObject({ status: 404 });
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('comparar un UUID consigo mismo, aunque cambien mayúsculas, no consulta SQL', async () => {
    const ds = { query: jest.fn() };
    await expect(new GreComparacionService(ds as any).comparar(versionId, versionId.toUpperCase()))
      .rejects.toMatchObject({ status: 400 });
    expect(ds.query).not.toHaveBeenCalled();
  });

  it('la comparación ignora ids de procedencia y detecta cambios de condiciones y notas', async () => {
    const anterior = randomUUID(), candidata = randomUUID();
    let cambiaContenido = false;
    const ds = { query: jest.fn(async (sql: string, parametros: string[]) => {
      if (sql.includes('SELECT id, estado')) return [{ id: anterior, estado: 'VALIDADA' }, { id: candidata, estado: 'REQUIERE_REVISION' }];
      const cambio = cambiaContenido && parametros[0] === candidata;
      if (sql.includes('FROM matpel.gre_tablas WHERE')) return [{ codigo: 'TABLA_1', titulo_original: 'Tabla',
        estructura_json: JSON.stringify({ notas: [{ textoOriginal: cambio ? 'Nota corregida' : 'Nota', fuentes: [parametros[0]] }] }) }];
      if (sql.includes('FROM matpel.gre_filas f JOIN')) return [{ codigo: 'TABLA_1', etiqueta_original: 'Fila',
        condiciones_json: JSON.stringify({ identificador: '0001', nombreNormalizado: 'FILA', derrameEn: cambio ? 'AGUA' : 'TIERRA' }),
        celdas: '[]' }];
      return [];
    }) };
    const servicio = new GreComparacionService(ds as any);
    const misma = await servicio.comparar(anterior, candidata);
    expect(misma.tablas.totales.cambios).toBe(0);
    expect(misma.filas.totales.cambios).toBe(0);
    cambiaContenido = true;
    const distinta = await servicio.comparar(anterior, candidata);
    expect(distinta.tablas.totales.cambios).toBe(1);
    expect(distinta.filas.totales.cambios).toBe(1);
  });

  it('iniciar la API no procesa importaciones cuando el trabajador está apagado', () => {
    const anterior = process.env.GRE_TRABAJADOR;
    delete process.env.GRE_TRABAJADOR;
    const intervalo = jest.spyOn(global, 'setInterval');
    const importacion = { procesarPendientes: jest.fn() };
    try {
      const trabajador = new GreTrabajadorService(importacion as any);
      trabajador.onApplicationBootstrap();
      expect(intervalo).not.toHaveBeenCalled();
      expect(importacion.procesarPendientes).not.toHaveBeenCalled();
      trabajador.onApplicationShutdown();
    } finally {
      intervalo.mockRestore();
      if (anterior === undefined) delete process.env.GRE_TRABAJADOR;
      else process.env.GRE_TRABAJADOR = anterior;
    }
  });
});
