import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { networkInterfaces } from 'os';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AlertasService } from '../alertas/alertas.service';
import { AppMovilService } from '../app-movil/app-movil.service';
import { AvisosVencimientoService } from '../control-personal/avisos-vencimiento.service';
import { DespachoTiempoReal } from '../despacho/despacho-tiempo-real.service';
import { GreTrabajadorService } from '../gre/gre-trabajador.service';
import { IaConfiguracionService } from '../ia/ia-configuracion.service';
import { OllamaService } from '../ia/ollama/ollama.service';
import { PiperService } from '../ia/piper/piper.service';
import { WhisperService } from '../ia/whisper/whisper.service';
import { TelegramService } from '../notificaciones/telegram.service';
import { MatrizWebService } from '../pantallas/matriz-web.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { conDependencia, directoriosSistema, leerCola } from './entorno';
import { contenidoQrConexion, direccionesDeRed } from './red.logica';
import { ARCHIVOS_REGISTRO, esClaveRegistro, nivelDeLinea, ocultarSecretos, ultimasLineas } from './registros.logica';
import { AlertaSistema } from './respaldos.logica';
import { ContextoSistema, RespaldosService } from './respaldos.service';

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));
const SILENCIO_AUDITORIA_MS = 10 * 60_000;

function leerVersion(): string | null {
  try {
    return (JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version?: string }).version ?? null;
  } catch {
    return null;
  }
}

async function responde(api: string): Promise<boolean> {
  try {
    const r = await fetch(`${api}/salud`, { signal: AbortSignal.timeout(2000) });
    const j = (await r.json().catch(() => ({}))) as { estado?: string };
    return r.status === 200 && j.estado === 'disponible';
  } catch {
    return false;
  }
}

/** Estado real de los servicios, agentes y tareas del sistema, y sus operaciones seguras. */
@Injectable()
export class SistemaService {
  private readonly version = leerVersion();
  private readonly lecturasRegistro = new Map<string, number>();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly matriz: MatrizWebService,
    private readonly auditoria: AuditoriaService,
    private readonly respaldos: RespaldosService,
    private readonly gre: GreTrabajadorService,
    private readonly avisos: AvisosVencimientoService,
    private readonly despacho: DespachoTiempoReal,
    private readonly alertas: AlertasService,
    private readonly iaConfig: IaConfiguracionService,
    private readonly ollama: OllamaService,
    private readonly whisper: WhisperService,
    private readonly piper: PiperService,
    private readonly appMovilService: AppMovilService,
    private readonly telegram: TelegramService,
  ) {}

  private async baseDeDatos() {
    const inicio = Date.now();
    try {
      await this.dataSource.query('SELECT 1 AS ok');
    } catch (e) {
      return { disponible: false as const, motivo: mensaje(e), latenciaMs: null, version: null, tamanioMb: null };
    }
    const latenciaMs = Date.now() - inicio;
    const version = await this.dataSource.query(`SELECT CAST(SERVERPROPERTY('ProductVersion') AS NVARCHAR(50)) AS v`).then((r: Array<{ v: string }>) => r[0]?.v ?? null).catch(() => null);
    const tamanioMb = await this.dataSource.query('SELECT CAST(SUM(size) * 8.0 / 1024 AS DECIMAL(12,1)) AS mb FROM sys.database_files').then((r: Array<{ mb: number }>) => (r[0]?.mb != null ? Number(r[0].mb) : null)).catch(() => null);
    return { disponible: true as const, motivo: null, latenciaMs, version, tamanioMb };
  }

  private async inteligencia() {
    try {
      const config = await this.iaConfig.obtener();
      const [ollama, whisper] = await Promise.all([
        this.ollama.estado(config).catch((e: unknown) => ({ conectado: false, error: mensaje(e) })),
        this.whisper.estado(config).catch((e: unknown) => ({ conectado: false, error: mensaje(e) })),
      ]);
      return { disponible: true as const, estado: config.estado, ollama, whisper, piper: this.piper.estado(config), motivo: null };
    } catch (e) {
      return { disponible: false as const, estado: null, ollama: null, whisper: null, piper: null, motivo: mensaje(e) };
    }
  }

  private async colaGre() {
    try {
      const [existe] = await this.dataSource.query(`SELECT OBJECT_ID(N'matpel.gre_importaciones', N'U') AS id`);
      if (!existe?.id) return { tablas: false as const, motivo: 'Las migraciones 094 y 095 (GRE) no están aplicadas.', porEstado: {} as Record<string, number> };
      const filas: Array<{ estado: string; n: number }> = await this.dataSource.query('SELECT estado, COUNT(*) AS n FROM matpel.gre_importaciones GROUP BY estado');
      return { tablas: true as const, motivo: null, porEstado: Object.fromEntries(filas.map((f) => [f.estado, Number(f.n)])) };
    } catch (e) {
      return { tablas: false as const, motivo: mensaje(e), porEstado: {} as Record<string, number> };
    }
  }

  async estado() {
    const [baseDeDatos, inteligencia, colaGre] = await Promise.all([this.baseDeDatos(), this.inteligencia(), this.colaGre()]);
    return {
      generadoEn: new Date(),
      backend: {
        version: this.version,
        node: process.version,
        entorno: process.env.NODE_ENV ?? 'development',
        plataforma: process.platform,
        segundosEncendido: Math.round(process.uptime()),
        memoriaMb: Math.round(process.memoryUsage().rss / 1_048_576),
      },
      baseDeDatos,
      inteligencia,
      telegram: { configurado: this.telegram.habilitado() },
      tiempoReal: {
        despacho: { conexiones: this.despacho.totalConexiones(), personas: this.despacho.personasConectadas() },
        alertas: { suscriptores: this.alertas.suscriptoresActivos() },
      },
      trabajos: { gre: { ...this.gre.estado(), cola: colaGre }, avisos: this.avisos.estado() },
      matriz: this.matriz.estado(),
    };
  }

  async resumen(): Promise<{ generadoEn: Date; nivel: 'normal' | 'atencion' | 'critico'; alertas: AlertaSistema[] }> {
    const [estado, respaldos, migraciones] = await Promise.all([
      this.estado(),
      this.respaldos.respaldos({ incluirTarea: false }).catch((e: unknown) => ({ alertas: [{ nivel: 'advertencia' as const, mensaje: `No se pudieron leer los respaldos: ${mensaje(e)}` }] })),
      this.respaldos.migraciones(),
    ]);
    const alertas: AlertaSistema[] = [];
    if (!estado.baseDeDatos.disponible) alertas.push({ nivel: 'critica', mensaje: `La base de datos no responde: ${estado.baseDeDatos.motivo}` });
    alertas.push(...respaldos.alertas);
    if (migraciones.disponible && migraciones.alteradas.length) alertas.push({ nivel: 'critica', mensaje: `Migraciones alteradas después de aplicarse: ${migraciones.alteradas.join(', ')}.` });
    if (migraciones.disponible && migraciones.pendientes.length) alertas.push({ nivel: 'info', mensaje: `${migraciones.pendientes.length} migración(es) pendiente(s): ${migraciones.pendientes.join(', ')}.` });
    if (!migraciones.disponible) alertas.push({ nivel: 'advertencia', mensaje: `No se pudo determinar el estado de las migraciones: ${migraciones.motivo}` });
    if (!estado.inteligencia.disponible) alertas.push({ nivel: 'advertencia', mensaje: `No se pudo determinar el estado de la inteligencia artificial: ${estado.inteligencia.motivo}` });
    const ollama = estado.inteligencia.ollama as { conectado?: boolean } | null;
    if (ollama && ollama.conectado === false) alertas.push({ nivel: 'advertencia', mensaje: 'Ollama no responde: Snoopy contesta con su motor local.' });
    if (!estado.matriz.sincronizada) alertas.push({ nivel: 'advertencia', mensaje: 'El catálogo de pantallas no se pudo sincronizar con la base.' });
    if (estado.trabajos.avisos.ultimoError) alertas.push({ nivel: 'advertencia', mensaje: `La última revisión de vencimientos falló: ${estado.trabajos.avisos.ultimoError}` });
    const pendientesGre = estado.trabajos.gre.cola.porEstado['PENDIENTE'] ?? 0;
    if (pendientesGre > 0 && !estado.trabajos.gre.activo) alertas.push({ nivel: 'info', mensaje: `${pendientesGre} importación(es) GRE pendiente(s) con el trabajador apagado.` });
    const nivel = alertas.some((a) => a.nivel === 'critica') ? 'critico' : alertas.some((a) => a.nivel === 'advertencia') ? 'atencion' : 'normal';
    return { generadoEn: new Date(), nivel, alertas };
  }

  async tareasYTrabajos() {
    let tareas: Awaited<ReturnType<RespaldosService['tareas']>> | null = null;
    let motivoTareas: string | null = null;
    try {
      tareas = await this.respaldos.tareas();
    } catch (e) {
      motivoTareas = mensaje(e);
    }
    const arranque = await this.registros('arranque-automatico', 30).catch(() => null);
    return {
      tareas,
      motivoTareas,
      arranque: arranque?.disponible ? arranque.lineas : [],
      trabajos: { gre: { ...this.gre.estado(), cola: await this.colaGre() }, avisos: this.avisos.estado() },
    };
  }

  async ejecutarAvisos(ctx: ContextoSistema) {
    const r = await conDependencia(() => this.avisos.ejecutarAhora());
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'AVISOS_VENCIMIENTO_EJECUTADOS', recurso: 'sistema.tareas', datosDespues: r, ip: ctx.ip, userAgent: ctx.userAgent });
    return r;
  }

  async registros(clave: string, lineas = 200, ctx?: ContextoSistema) {
    if (!esClaveRegistro(clave)) throw new BadRequestException('Registro desconocido.');
    const archivo = ARCHIVOS_REGISTRO[clave];
    const ruta = join(directoriosSistema().logs, archivo);
    if (!existsSync(ruta)) return { clave, archivo, disponible: false as const, motivo: `No existe ${archivo} en la carpeta de registros.`, actualizadoEn: null, lineas: [] as Array<{ texto: string; nivel: string }> };
    const n = Math.min(Math.max(Number(lineas) || 200, 10), 500);
    const [texto, info] = await Promise.all([leerCola(ruta, 256 * 1024), stat(ruta)]);
    if (ctx) await this.auditarLectura(ctx, clave);
    return {
      clave,
      archivo,
      disponible: true as const,
      motivo: null,
      actualizadoEn: info.mtime,
      lineas: ultimasLineas(texto, n).map((t) => {
        const limpia = ocultarSecretos(t);
        return { texto: limpia, nivel: nivelDeLinea(limpia) };
      }),
    };
  }

  /** Leer registros queda auditado, una vez cada 10 minutos por persona y archivo (se consultan cada 5 s). */
  private async auditarLectura(ctx: ContextoSistema, clave: string) {
    const llave = `${ctx.usuarioId}|${clave}`;
    if (Date.now() - (this.lecturasRegistro.get(llave) ?? 0) < SILENCIO_AUDITORIA_MS) return;
    // recursoId es uniqueidentifier: el nombre del archivo va en metadata.
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'REGISTROS_LEIDOS', recurso: 'sistema.registros', metadata: { archivo: clave }, ip: ctx.ip, userAgent: ctx.userAgent });
    this.lecturasRegistro.set(llave, Date.now());
  }

  appMovil() {
    return { ...this.appMovilService.obtenerVersion(), huellaCertificado: this.appMovilService.huellaCertificado() };
  }

  async conexionMovil() {
    const puerto = Number(process.env.PORT) || 3001;
    const direcciones = await Promise.all(direccionesDeRed(networkInterfaces()).map(async (d) => {
      const api = `http://${d.ip}:${puerto}/api/v1`;
      return { ...d, api, responde: await responde(api), qrConectar: contenidoQrConexion(api), urlInstalar: `${api}/app-movil/descargar` };
    }));
    return { puerto, apkDisponible: this.appMovilService.obtenerVersion().disponible, direcciones };
  }
}
