import { BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { AvisosVencimientoService } from '../control-personal/avisos-vencimiento.service';
import { GreTrabajadorService } from '../gre/gre-trabajador.service';
import { leerCola, NoDisponible } from './entorno';
import { RespaldosService } from './respaldos.service';
import { SistemaService } from './sistema.service';

const ctx = { usuarioId: 'u1', ip: '127.0.0.1', userAgent: 'jest' };
const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };

const carpetas: string[] = [];
function carpetaTemporal() {
  const d = mkdtempSync(join(tmpdir(), 'sigbo-sistema-'));
  carpetas.push(d);
  return d;
}

afterAll(() => {
  for (const d of carpetas) rmSync(d, { recursive: true, force: true });
  for (const v of ['SIGBO_RESPALDOS_DIR', 'SIGBO_LOGS_DIR', 'SIGBO_DATABASE_DIR']) delete process.env[v];
});

function tareasJson(estado: string) {
  return JSON.stringify([
    { nombre: 'SIGBO-Respaldo-Diario', existe: true, estado, ultimaEjecucion: '/Date(1791448174000)/', ultimoResultado: 0, proximaEjecucion: '/Date(1791525600000)/' },
    { nombre: 'SIGBO-Arranque-Automatico', existe: false },
  ]);
}

describe('RespaldosService', () => {
  let respaldos: string;
  beforeEach(() => {
    respaldos = carpetaTemporal();
    process.env.SIGBO_RESPALDOS_DIR = respaldos;
    auditoria.registrar.mockClear();
  });
  afterAll(() => { delete process.env.SIGBO_RESPALDOS_DIR; delete process.env.SIGBO_DATABASE_DIR; });

  it('"Respaldar ahora" dos veces seguidas: la segunda responde 409 y no lanza otra corrida', async () => {
    const ejecutor = jest.fn(async (script: string) => (script.startsWith('Start-ScheduledTask') ? '' : tareasJson('Ready')));
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, ejecutor);
    await expect(s.respaldarAhora(ctx)).resolves.toMatchObject({ lanzado: true });
    await expect(s.respaldarAhora(ctx)).rejects.toBeInstanceOf(ConflictException);
    expect(ejecutor.mock.calls.filter(([sc]) => sc.startsWith('Start-ScheduledTask'))).toHaveLength(1);
    expect(auditoria.registrar).toHaveBeenCalledTimes(1);
  });

  it('dos "Respaldar ahora" simultáneos: uno lanza y el otro responde 409; una sola auditoría', async () => {
    let lanzamientos = 0;
    const ejecutor = jest.fn(async (script: string) => {
      if (script.startsWith('Start-ScheduledTask')) { lanzamientos++; await new Promise((r) => setTimeout(r, 20)); return ''; }
      return tareasJson('Ready');
    });
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, ejecutor);
    const r = await Promise.allSettled([s.respaldarAhora(ctx), s.respaldarAhora(ctx)]);
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(1);
    const rechazada = r.find((x) => x.status === 'rejected') as PromiseRejectedResult;
    expect(rechazada.reason).toBeInstanceOf(ConflictException);
    expect(lanzamientos).toBe(1);
    expect(auditoria.registrar).toHaveBeenCalledTimes(1);
  });

  it('si el lanzamiento falla, se puede reintentar (la marca se libera)', async () => {
    let falla = true;
    const ejecutor = jest.fn(async (script: string) => {
      if (script.startsWith('Start-ScheduledTask')) { if (falla) throw new Error('acceso denegado'); return ''; }
      return tareasJson('Ready');
    });
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, ejecutor);
    await expect(s.respaldarAhora(ctx)).rejects.toBeInstanceOf(ServiceUnavailableException);
    falla = false;
    await expect(s.respaldarAhora(ctx)).resolves.toMatchObject({ lanzado: true });
  });

  it('el ejecutor falla: 503 con el motivo; un 409 pasa sin tocar', async () => {
    const noDisp = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn().mockRejectedValue(new NoDisponible('Solo en Windows.')));
    await expect(noDisp.respaldarAhora(ctx)).rejects.toMatchObject({ message: 'Solo en Windows.' });
    await expect(noDisp.respaldarAhora(ctx)).rejects.toBeInstanceOf(ServiceUnavailableException);
    const generico = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn().mockRejectedValue(new Error('boom')));
    await expect(generico.respaldarAhora(ctx)).rejects.toBeInstanceOf(ServiceUnavailableException);
    const conflicto = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn().mockRejectedValue(new ConflictException('ya')));
    await expect(conflicto.respaldarAhora(ctx)).rejects.toBeInstanceOf(ConflictException);
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('tareas(): comparte la consulta en vuelo y cachea el fallo (un solo powershell)', async () => {
    const ejecutor = jest.fn(async () => { await new Promise((r) => setTimeout(r, 20)); throw new NoDisponible('colgado'); });
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, ejecutor);
    const r = await Promise.allSettled([s.tareas(), s.tareas()]);
    expect(r.every((x) => x.status === 'rejected')).toBe(true);
    await expect(s.tareas()).rejects.toBeInstanceOf(NoDisponible);
    expect(ejecutor).toHaveBeenCalledTimes(1);
  });

  it('un respaldo con fecha imposible no rompe la lista', async () => {
    writeFileSync(join(respaldos, 'sigbo_cbvc-20261399-000000.bak'), 'x');
    writeFileSync(join(respaldos, 'sigbo_cbvc-20261008-081341.bak'), 'x');
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => tareasJson('Ready')));
    const r = await s.respaldos();
    expect(r.archivos.map((a) => a.nombre)).toEqual(['sigbo_cbvc-20261008-081341.bak']);
  });

  it('respaldos({ incluirTarea: false }) no consulta PowerShell', async () => {
    const ejecutor = jest.fn();
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, ejecutor);
    await s.respaldos({ incluirTarea: false });
    expect(ejecutor).not.toHaveBeenCalled();
  });

  it('no lanza si la tarea ya está en ejecución o no existe', async () => {
    const corriendo = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => tareasJson('Running')));
    await expect(corriendo.respaldarAhora(ctx)).rejects.toThrow(/en curso/);
    const sinTarea = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => '[{"nombre":"SIGBO-Respaldo-Diario","existe":false}]'));
    await expect(sinTarea.respaldarAhora(ctx)).rejects.toThrow(/programar-respaldo/);
  });

  it('verificar: un nombre malicioso se rechaza sin tocar el disco', async () => {
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn());
    for (const malo of ['..\\..\\backend\\.env', 'sigbo_cbvc-20261009-082934.bak/../x', '../sigbo_cbvc-20261009-082934.bak']) {
      await expect(s.verificarRespaldo(malo, ctx)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('verificar: recalcula el SHA-256 y lo compara con su .sha256', async () => {
    const nombre = 'sigbo_cbvc-20261009-082934.bak';
    writeFileSync(join(respaldos, nombre), 'contenido del respaldo');
    const hash = createHash('sha256').update('contenido del respaldo').digest('hex');
    writeFileSync(join(respaldos, `${nombre}.sha256`), `${hash}  ${nombre}\n`);
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn());
    await expect(s.verificarRespaldo(nombre, ctx)).resolves.toMatchObject({ coincide: true, sha256: hash });
    writeFileSync(join(respaldos, `${nombre}.sha256`), `${'0'.repeat(64)}  ${nombre}\n`);
    await expect(s.verificarRespaldo(nombre, ctx)).resolves.toMatchObject({ coincide: false });
  });

  it('lista respaldos con su fecha, el registro y las alertas', async () => {
    writeFileSync(join(respaldos, 'sigbo_cbvc-20261008-081341.bak'), 'x');
    writeFileSync(join(respaldos, 'otro-archivo.txt'), 'x');
    writeFileSync(join(respaldos, 'registro.log'), '[1/5] Respaldando sigbo_cbvc ...\r\nRESULTADO: OK\r\n');
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => tareasJson('Ready')));
    const r = await s.respaldos();
    expect(r.archivos.map((a) => a.nombre)).toEqual(['sigbo_cbvc-20261008-081341.bak']);
    expect(r.archivos[0]).toMatchObject({ fecha: '2026-10-08T08:13:41', tieneSha256: false });
    expect(r.corridas).toHaveLength(1);
    expect(r.alertas.some((a) => a.mensaje.includes('.sha256'))).toBe(true);
  });

  it('migraciones: manifiesto contra la tabla de historial', async () => {
    const db = carpetaTemporal();
    process.env.SIGBO_DATABASE_DIR = db;
    writeFileSync(join(db, 'migrations.sha256'), `${'A'.repeat(64)}  093_x.sql\n${'B'.repeat(64)}  094_y.sql\n`);
    const query = jest.fn().mockResolvedValue([{ nombre: '093_x.sql', hash: 'a'.repeat(64), aplicadaEn: new Date('2026-10-07T10:00:00Z') }]);
    const s = new RespaldosService({ query } as never, auditoria as never, jest.fn());
    await expect(s.migraciones()).resolves.toMatchObject({ disponible: true, aplicadas: 1, pendientes: ['094_y.sql'], alteradas: [] });
  });
});

describe('SistemaService', () => {
  const nuevo = (o: Partial<Record<string, unknown>> = {}) => new SistemaService(
    { query: jest.fn().mockResolvedValue([{ ok: 1 }]) } as never,
    { estado: () => ({ activa: true, sincronizada: true, error: null, pantallas: 1, secciones: 10, rutasBackend: 1, llamadasSinResolver: 0 }) } as never,
    auditoria as never,
    (o.respaldos ?? { respaldos: jest.fn().mockResolvedValue({ alertas: [] }), migraciones: jest.fn().mockResolvedValue({ disponible: true, alteradas: [], pendientes: [] }), tareas: jest.fn().mockResolvedValue([]) }) as never,
    { estado: () => ({ activo: false, ocupado: false }) } as never,
    (o.avisos ?? { estado: () => ({ programado: true, ocupado: false }), ejecutarAhora: jest.fn().mockResolvedValue({ enviados: 0, motivo: 'Telegram no configurado' }) }) as never,
    { totalConexiones: () => 2, personasConectadas: () => 1 } as never,
    { suscriptoresActivos: () => 3 } as never,
    { obtener: jest.fn().mockResolvedValue({ estado: 'ACTIVA' }) } as never,
    { estado: jest.fn().mockResolvedValue({ conectado: false, url: 'http://localhost:11434', modelosInstalados: [], modeloConfigurado: 'x', modeloDisponible: false, error: 'sin conexión' }) } as never,
    { estado: jest.fn().mockResolvedValue({ conectado: false, url: '', error: null }) } as never,
    { estado: jest.fn().mockReturnValue({ disponible: false, rutaBinario: null, rutaVoz: null, error: 'sin configurar' }) } as never,
    { obtenerVersion: () => ({ disponible: false }), huellaCertificado: () => null } as never,
    { habilitado: () => false } as never,
  );

  it('ejecutar avisos ya en curso responde 409', async () => {
    const avisos = { estado: () => ({}), ejecutarAhora: jest.fn().mockRejectedValue(new ConflictException('ya está corriendo')) };
    auditoria.registrar.mockClear();
    await expect(nuevo({ avisos }).ejecutarAvisos(ctx)).rejects.toBeInstanceOf(ConflictException);
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('ejecutar avisos: si el servicio falla por otra causa responde 503 con el motivo', async () => {
    const avisos = { estado: () => ({}), ejecutarAhora: jest.fn().mockRejectedValue(new Error('base caída')) };
    auditoria.registrar.mockClear();
    await expect(nuevo({ avisos }).ejecutarAvisos(ctx)).rejects.toMatchObject({ message: 'base caída' });
    await expect(nuevo({ avisos }).ejecutarAvisos(ctx)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('el resumen avisa cuando no puede saber el estado de migraciones o de la IA', async () => {
    const respaldos = { respaldos: jest.fn().mockResolvedValue({ alertas: [] }), migraciones: jest.fn().mockResolvedValue({ disponible: false, motivo: 'sin manifiesto' }), tareas: jest.fn() };
    const r = await nuevo({ respaldos }).resumen();
    expect(r.alertas.some((a) => a.nivel === 'advertencia' && a.mensaje.includes('migraciones') && a.mensaje.includes('sin manifiesto'))).toBe(true);
    expect(respaldos.respaldos).toHaveBeenCalledWith({ incluirTarea: false });
    expect(respaldos.tareas).not.toHaveBeenCalled();
  });

  it('registros: solo la lista cerrada, con secretos ocultos', async () => {
    const logs = carpetaTemporal();
    process.env.SIGBO_LOGS_DIR = logs;
    try {
    writeFileSync(join(logs, 'backend-err.log'), 'linea 1\nDB_PASSWORD=Secreta123 al conectar\n[Nest] 1 - ERROR [X] fallo\n');
    const s = nuevo();
    await expect(s.registros('..\\..\\backend\\.env', 50, ctx)).rejects.toBeInstanceOf(BadRequestException);
    const r = await s.registros('backend-err', 50, ctx);
    expect(r.lineas.map((l) => l.texto)).toEqual(['linea 1', 'DB_PASSWORD=[oculto] al conectar', '[Nest] 1 - ERROR [X] fallo']);
    expect(r.lineas[2].nivel).toBe('ERROR');
    // recursoId es uniqueidentifier en la base: el nombre del archivo no puede ir ahi.
    const llamada = auditoria.registrar.mock.calls.at(-1)?.[0];
    expect(llamada).toMatchObject({ accion: 'REGISTROS_LEIDOS', metadata: { archivo: 'backend-err' } });
    expect(llamada.recursoId).toBeUndefined();
    } finally {
      delete process.env.SIGBO_LOGS_DIR;
    }
  });

  it('el resumen es "atención" si Ollama no responde', async () => {
    await expect(nuevo().resumen()).resolves.toMatchObject({ nivel: 'atencion' });
  });

  it('el resumen es "crítico" si la base no responde', async () => {
    const s = nuevo();
    (s as unknown as { dataSource: { query: jest.Mock } }).dataSource.query = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(s.resumen()).resolves.toMatchObject({ nivel: 'critico' });
  });

  it('el estado informa las conexiones en tiempo real y la matriz', async () => {
    const e = await nuevo().estado();
    expect(e.tiempoReal).toEqual({ despacho: { conexiones: 2, personas: 1 }, alertas: { suscriptores: 3 } });
    expect(e.matriz.sincronizada).toBe(true);
    expect(e.baseDeDatos.disponible).toBe(true);
  });
});

describe('leerCola', () => {
  it('un corte dentro de un carácter multibyte no estropea el resto de la cola', async () => {
    const dir = carpetaTemporal();
    const ruta = join(dir, 'x.log');
    writeFileSync(ruta, 'ñandú descartado\nlínea completa con ñ\nsegunda ñandú\n', 'utf8');
    const total = Buffer.byteLength('ñandú descartado\nlínea completa con ñ\nsegunda ñandú\n');
    // Corta justo en medio de la primera "ñ" (2 bytes) y cae antes del primer salto de línea.
    const texto = await leerCola(ruta, total - 1);
    expect(texto).toBe('línea completa con ñ\nsegunda ñandú\n');
  });
});

describe('guardas de trabajos en vuelo', () => {
  it('AvisosVencimientoService.ejecutarAhora: una segunda llamada en vuelo responde 409', async () => {
    let soltar: (v: never[]) => void = () => undefined;
    const venc = { vencimientos: jest.fn(() => new Promise<never[]>((r) => { soltar = r; })) };
    const s = new AvisosVencimientoService({ getRepository: jest.fn() } as never, venc as never, { habilitado: () => true, enviar: jest.fn() } as never);
    const primera = s.ejecutarAhora();
    await expect(s.ejecutarAhora()).rejects.toBeInstanceOf(ConflictException);
    soltar([]);
    await expect(primera).resolves.toMatchObject({ enviados: 0 });
    expect(s.estado().ocupado).toBe(false);
  });

  it('GreTrabajadorService.iniciarProcesamiento: una segunda llamada mientras procesa responde 409', async () => {
    let soltar: (n: number) => void = () => undefined;
    const importacion = { procesarPendientes: jest.fn(() => new Promise<number>((r) => { soltar = r; })) };
    const s = new GreTrabajadorService(importacion as never);
    expect(s.iniciarProcesamiento()).toEqual({ iniciado: true });
    expect(() => s.iniciarProcesamiento()).toThrow(ConflictException);
    soltar(0);
    await new Promise((r) => setImmediate(r));
    expect(s.estado().ocupado).toBe(false);
  });
});
