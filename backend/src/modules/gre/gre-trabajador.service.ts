import { ConflictException, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { GreImportacionService } from './gre-importacion.service';

/** Trabajador local de importaciones GRE. Apagado salvo GRE_TRABAJADOR=activo: arrancar
 * la API no extrae ni carga nada. Sin él, `npm run gre:procesar` procesa la cola una vez. */
@Injectable()
export class GreTrabajadorService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly log = new Logger('GreTrabajador');
  private reloj: NodeJS.Timeout | null = null;
  private intervaloMs: number | null = null;
  private ocupado = false;
  private ultima: { en: Date; procesados: number; error: string | null } | null = null;

  constructor(private readonly importacion: GreImportacionService) {}

  onApplicationBootstrap() {
    if (process.env.GRE_TRABAJADOR !== 'activo') return;
    const intervalo = Math.max(5_000, Number(process.env.GRE_TRABAJADOR_INTERVALO_MS) || 30_000);
    this.intervaloMs = intervalo;
    this.log.log(`Trabajador GRE activo cada ${intervalo} ms.`);
    this.reloj = setInterval(() => void this.ciclo(), intervalo);
  }

  onApplicationShutdown() {
    if (this.reloj) clearInterval(this.reloj);
  }

  private async ciclo() {
    if (this.ocupado) return;
    this.ocupado = true;
    try {
      const procesados = await this.importacion.procesarPendientes(1);
      this.ultima = { en: new Date(), procesados, error: null };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.ultima = { en: new Date(), procesados: 0, error: mensaje };
      this.log.error(`Ciclo del trabajador GRE: ${mensaje}`);
    } finally {
      this.ocupado = false;
    }
  }

  /** Lo que muestra Sistema › Tareas. */
  estado() {
    return {
      activo: this.reloj !== null,
      intervaloMs: this.intervaloMs,
      ocupado: this.ocupado,
      ultimaEjecucion: this.ultima?.en ?? null,
      ultimosProcesados: this.ultima?.procesados ?? null,
      ultimoError: this.ultima?.error ?? null,
    };
  }

  /** "Procesar ahora": una importacion puede tardar minutos (Python), asi que corre en segundo plano. */
  iniciarProcesamiento(): { iniciado: true } {
    if (this.ocupado) throw new ConflictException('El trabajador GRE ya está procesando una importación.');
    void this.ciclo();
    return { iniciado: true };
  }
}
