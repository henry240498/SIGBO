import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { GreImportacionService } from './gre-importacion.service';

/** Trabajador local de importaciones GRE. Apagado salvo GRE_TRABAJADOR=activo: arrancar
 * la API no extrae ni carga nada. Sin él, `npm run gre:procesar` procesa la cola una vez. */
@Injectable()
export class GreTrabajadorService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly log = new Logger('GreTrabajador');
  private reloj: NodeJS.Timeout | null = null;
  private ocupado = false;

  constructor(private readonly importacion: GreImportacionService) {}

  onApplicationBootstrap() {
    if (process.env.GRE_TRABAJADOR !== 'activo') return;
    const intervalo = Math.max(5_000, Number(process.env.GRE_TRABAJADOR_INTERVALO_MS) || 30_000);
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
      await this.importacion.procesarPendientes(1);
    } catch (error) {
      this.log.error(`Ciclo del trabajador GRE: ${error instanceof Error ? error.message : error}`);
    } finally {
      this.ocupado = false;
    }
  }
}
