import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { execFile } from 'child_process';
import { join, resolve } from 'path';
import { GRE_RAIZ_PRIVADA } from './gre-fuentes.service';

export interface CandidatoGre {
  archivo: string; sha256: string; bytes: number; paginas: number; edicion: string; idioma: string; titulo: string;
  identificacion: unknown;
}
export interface ResultadoCatalogo {
  artefacto: string; artefactoSha256: string; artefactoBytes: number; artefactoNuevo: boolean; documentoSha256: string;
}

/** Proceso local de extracción (scripts/matpel). Argumentos fijos por el servidor: el
 * cliente nunca aporta rutas, comandos ni nombres de archivo; solo elige un hash que
 * aparece en el descubrimiento. Sin shell, con límite de tiempo y de salida. */
@Injectable()
export class GreProcesoService {
  readonly python = process.env.GRE_PYTHON || 'python';
  readonly script = resolve(process.env.GRE_SCRIPTS || join(process.cwd(), '..', 'scripts', 'matpel'), 'importar_gre.py');
  readonly carpeta = resolve(process.env.GRE_CARPETA_FUENTES || join(process.cwd(), '..', 'docs', 'Manuales'));

  constructor(@Inject(GRE_RAIZ_PRIVADA) private readonly raizPrivada: string) {}

  listar(): Promise<{ candidatos: CandidatoGre[]; descartados: { archivo: string; motivo: string }[] }> {
    return this.ejecutar(['--listar', '--carpeta', this.carpeta], 120_000);
  }

  versiones(): Promise<{ versionParser: string; versionNormalizador: string; pymupdf: string }> {
    return this.ejecutar(['--versiones'], 60_000);
  }

  catalogo(archivo: string): Promise<ResultadoCatalogo> {
    return this.ejecutar(['--catalogo', '--carpeta', this.carpeta, '--documento', archivo,
      '--almacenamiento', resolve(this.raizPrivada)], 20 * 60_000);
  }

  private ejecutar<T>(argumentos: string[], tiempoMs: number): Promise<T> {
    return new Promise((ok, falla) => {
      execFile(this.python, [this.script, ...argumentos], {
        timeout: tiempoMs, maxBuffer: 16 * 1024 * 1024, windowsHide: true, shell: false,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
      }, (error, salida, errores) => {
        if (error) {
          let motivo = 'El proceso de extracción GRE no terminó correctamente.';
          try { motivo = JSON.parse(String(errores)).error ?? motivo; } catch { /* stderr no JSON */ }
          if ((error as any).killed) motivo = 'El proceso de extracción GRE excedió su tiempo.';
          if ((error as any).code === 'ENOENT') motivo = 'No se encontró el intérprete Python configurado (GRE_PYTHON).';
          return falla(new ServiceUnavailableException(motivo));
        }
        try { ok(JSON.parse(String(salida))); } catch {
          falla(new ServiceUnavailableException('El proceso de extracción GRE devolvió una salida ilegible.'));
        }
      });
    });
  }
}
