import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { conDependencia, directoriosSistema, EJECUTOR_POWERSHELL, EjecutorPowerShell, ejecutarPowerShell } from './entorno';
import { compararMigraciones, EstadoMigraciones, parsearManifiesto } from './migraciones.logica';
import { alertasRespaldo, fechaDeRespaldo, NOMBRE_RESPALDO, parsearRegistro, RespaldoArchivo, validarNombreRespaldo } from './respaldos.logica';
import { parsearTareas, SCRIPT_CONSULTA_TAREAS, scriptIniciarTarea, TareaProgramada } from './tareas.logica';

export interface ContextoSistema { usuarioId: string; ip: string | null; userAgent: string | null }

const VIGENCIA_TAREAS_MS = 15_000;
/** Despues de lanzar un respaldo, Windows tarda unos segundos en marcarlo "en ejecucion". */
const VENTANA_LANZAMIENTO_MS = 60_000;
const TAREA_RESPALDO = 'SIGBO-Respaldo-Diario' as const;

function sha256DeArchivo(ruta: string): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const hash = createHash('sha256');
    createReadStream(ruta).on('data', (d) => hash.update(d)).on('end', () => resolver(hash.digest('hex'))).on('error', rechazar);
  });
}

/** Respaldos (tarea programada existente) y migraciones: lectura y las dos operaciones seguras. */
@Injectable()
export class RespaldosService {
  private cacheTareas: { en: number; tareas: TareaProgramada[] } | null = null;
  private falloTareas: { en: number; error: unknown } | null = null;
  private consultaTareas: Promise<TareaProgramada[]> | null = null;
  /** Marca sincrona de "ya estoy lanzando un respaldo": cierra la carrera entre dos POST simultaneos. */
  private lanzando = false;
  private respaldoLanzadoEn = 0;
  private readonly ejecutor: EjecutorPowerShell;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    @Optional() @Inject(EJECUTOR_POWERSHELL) ejecutor?: EjecutorPowerShell,
  ) {
    this.ejecutor = ejecutor ?? ejecutarPowerShell;
  }

  async tareas(sinCache = false): Promise<TareaProgramada[]> {
    if (!sinCache) {
      if (this.cacheTareas && Date.now() - this.cacheTareas.en < VIGENCIA_TAREAS_MS) return this.cacheTareas.tareas;
      // Un Programador de tareas colgado no debe lanzar un powershell.exe nuevo por cada consulta.
      if (this.falloTareas && Date.now() - this.falloTareas.en < VIGENCIA_TAREAS_MS) throw this.falloTareas.error;
    }
    if (this.consultaTareas) return this.consultaTareas;
    const consulta = (async () => {
      try {
        const tareas = parsearTareas(await this.ejecutor(SCRIPT_CONSULTA_TAREAS));
        this.cacheTareas = { en: Date.now(), tareas };
        this.falloTareas = null;
        return tareas;
      } catch (error) {
        this.falloTareas = { en: Date.now(), error };
        throw error;
      } finally {
        this.consultaTareas = null;
      }
    })();
    this.consultaTareas = consulta;
    return consulta;
  }

  async respaldos(opciones: { incluirTarea?: boolean } = {}) {
    const incluirTarea = opciones.incluirTarea ?? true;
    const { respaldos: carpeta } = directoriosSistema();
    if (!existsSync(carpeta)) {
      return { disponible: false, motivo: `No existe la carpeta de respaldos (${carpeta}).`, carpeta, archivos: [] as RespaldoArchivo[], corridas: [], alertas: alertasRespaldo([], [], new Date()), tarea: null };
    }
    const nombres = await readdir(carpeta);
    const archivos: RespaldoArchivo[] = [];
    for (const nombre of nombres.filter((n) => NOMBRE_RESPALDO.test(n))) {
      const fecha = fechaDeRespaldo(nombre);
      if (fecha === null) continue; // fecha imposible: no es un respaldo de este sistema
      const info = await stat(join(carpeta, nombre));
      archivos.push({ nombre, fecha, tamanioBytes: info.size, tieneSha256: nombres.includes(`${nombre}.sha256`) });
    }
    archivos.sort((a, b) => b.fecha.localeCompare(a.fecha));
    const registro = await readFile(join(carpeta, 'registro.log'), 'utf8').catch(() => '');
    const corridas = parsearRegistro(registro);
    let tarea: TareaProgramada | { disponible: false; motivo: string } | null = null;
    if (incluirTarea) {
      try {
        tarea = (await this.tareas()).find((t) => t.nombre === TAREA_RESPALDO) ?? null;
      } catch (e) {
        tarea = { disponible: false, motivo: e instanceof Error ? e.message : 'No se pudo consultar la tarea.' };
      }
    }
    return {
      disponible: true,
      motivo: null,
      carpeta,
      archivos,
      corridas: corridas.slice(-10).reverse(),
      alertas: alertasRespaldo(archivos, corridas, new Date()),
      tarea,
    };
  }

  async respaldarAhora(ctx: ContextoSistema) {
    // Se marca antes de cualquier await: dos POST simultaneos no pueden pasar los dos.
    if (this.lanzando) throw new ConflictException('Ya hay un respaldo en curso. Esperá a que termine; esta pantalla se actualiza sola.');
    this.lanzando = true;
    try {
      const tarea = (await conDependencia(() => this.tareas(true))).find((t) => t.nombre === TAREA_RESPALDO);
      if (!tarea?.existe) {
        throw new ConflictException('La tarea SIGBO-Respaldo-Diario no está programada en este servidor. Se programa con workflows\\scripts\\programar-respaldo.ps1.');
      }
      if (tarea.estado === 'EN_EJECUCION' || Date.now() - this.respaldoLanzadoEn < VENTANA_LANZAMIENTO_MS) {
        throw new ConflictException('Ya hay un respaldo en curso. Esperá a que termine; esta pantalla se actualiza sola.');
      }
      if (tarea.estado === 'DESHABILITADA') throw new ConflictException('La tarea de respaldo está deshabilitada en Windows.');
      await conDependencia(() => this.ejecutor(scriptIniciarTarea(TAREA_RESPALDO)));
      this.respaldoLanzadoEn = Date.now();
      this.cacheTareas = null;
      await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'RESPALDO_SOLICITADO', recurso: 'sistema.respaldos', ip: ctx.ip, userAgent: ctx.userAgent });
      return { lanzado: true, mensaje: 'Respaldo iniciado. Tarda uno o dos minutos; esta pantalla se actualiza sola.' };
    } finally {
      this.lanzando = false;
    }
  }

  async verificarRespaldo(nombre: string, ctx: ContextoSistema) {
    if (!validarNombreRespaldo(nombre)) throw new BadRequestException('Nombre de respaldo inválido.');
    const ruta = join(directoriosSistema().respaldos, nombre);
    if (!existsSync(ruta)) throw new NotFoundException('El respaldo no existe.');
    const esperado = await readFile(`${ruta}.sha256`, 'utf8').then((t) => t.trim().split(/\s+/)[0].toLowerCase()).catch(() => null);
    const sha256 = await conDependencia(() => sha256DeArchivo(ruta));
    const coincide = esperado ? esperado === sha256 : null;
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'RESPALDO_VERIFICADO', recurso: 'sistema.respaldos', metadata: { archivo: nombre }, datosDespues: { coincide }, ip: ctx.ip, userAgent: ctx.userAgent });
    return { nombre, sha256, esperado, coincide };
  }

  async migraciones(): Promise<({ disponible: true } & EstadoMigraciones & { comando: string }) | { disponible: false; motivo: string }> {
    const manifiesto = join(directoriosSistema().database, 'migrations.sha256');
    let texto: string;
    try {
      texto = await readFile(manifiesto, 'utf8');
    } catch {
      return { disponible: false, motivo: `No se encontró el manifiesto de migraciones (${manifiesto}).` };
    }
    let aplicadas: Array<{ nombre: string; hash: string; aplicadaEn: Date }>;
    try {
      aplicadas = await this.dataSource.query('SELECT nombre, hash_sha256 AS hash, aplicada_en AS aplicadaEn FROM dbo.__sigbo_migrations');
    } catch (e) {
      return { disponible: false, motivo: `No se pudo leer dbo.__sigbo_migrations: ${e instanceof Error ? e.message : 'error'}` };
    }
    return { disponible: true, ...compararMigraciones(parsearManifiesto(texto), aplicadas), comando: 'database\\run-migrations.ps1' };
  }
}
