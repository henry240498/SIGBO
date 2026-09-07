import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { ConfiguracionIa } from '../../../shared/entities';

export interface EstadoPiper {
  disponible: boolean;
  rutaBinario: string | null;
  rutaVoz: string | null;
  error: string | null;
}

export interface VozPiperDisponible {
  archivo: string;
  ruta: string;
  etiqueta: string;
}

export interface ResultadoSintesis {
  ok: boolean;
  audioWav: Buffer | null;
  error: string | null;
}

/** Cliente de Piper TTS LOCAL para la "voz" de Snoopy (Etapa 2, seccion 4
 * del pedido de voz). Misma excepcion acotada que Ollama/whisper.cpp: un
 * binario que corre en la misma maquina, nunca sale a internet. Unica
 * responsabilidad: texto -> audio. Piper NUNCA recibe el mensaje original
 * del usuario -- solo el texto de respuesta que `IaMotorService` YA
 * calculo y YA autorizo (mismo principio que `OllamaService.reformular()`,
 * mitigacion de inyeccion: una instruccion maliciosa del usuario no tiene
 * forma de llegarle a Piper disfrazada de "texto a hablar"). A diferencia
 * de whisper.cpp, no corre como servidor HTTP: Piper es un binario CLI de
 * un solo uso por invocacion, mas simple de administrar para un volumen de
 * consultas espaciado (no un dictado continuo). Ningun metodo lanza: si el
 * binario no esta instalado, la voz no esta configurada o tarda mas del
 * timeout, se devuelve un resultado "vacio" para que el llamador muestre
 * la respuesta en texto igual (seccion 13, fallback -- "una falla de voz
 * nunca inutiliza a Snoopy"). */
@Injectable()
export class PiperService {
  private readonly logger = new Logger(PiperService.name);

  /** Estado para el panel de administracion: confirma que el binario y la
   * voz seleccionada existen en disco -- Piper no es un servicio con el
   * que se pueda hacer un "ping" de red como Ollama/whisper.cpp. */
  estado(config: ConfiguracionIa): EstadoPiper {
    const rutaBinario = config.piperRutaBinario;
    const rutaVoz = config.piperRutaVoz;
    if (!rutaBinario || !existsSync(rutaBinario)) {
      return { disponible: false, rutaBinario, rutaVoz, error: 'No se encontró el ejecutable de Piper en la ruta configurada.' };
    }
    if (!rutaVoz || !existsSync(rutaVoz)) {
      return { disponible: false, rutaBinario, rutaVoz, error: 'No se encontró el archivo de voz configurado.' };
    }
    return { disponible: true, rutaBinario, rutaVoz, error: null };
  }

  /** Voces reales instaladas en disco (Cierre de Snoopy: "listame un
   * combo con las diferentes voces, no solo una por defecto"). Antes,
   * `piperRutaVoz`/`vozSeleccionada` eran texto libre -- el administrador
   * tenia que escribir a mano la ruta completa al .onnx, sin forma de ver
   * que voces existian realmente. Escanea la MISMA carpeta donde vive la
   * voz configurada (o `piper/voces` junto al binario si todavia no hay
   * ninguna configurada) y devuelve solo archivos .onnx que realmente
   * existen -- nunca una lista inventada de voces que Piper no tiene
   * instaladas. Los nombres de archivo siguen la convencion real de Piper
   * (`<idioma>_<REGION>-<nombre>-<calidad>.onnx`, ej.
   * "es_AR-daniela-high") -- se arma una etiqueta legible a partir de esa
   * convencion; si un archivo no la sigue, se usa el nombre tal cual. */
  listarVoces(config: ConfiguracionIa): VozPiperDisponible[] {
    const carpeta = config.piperRutaVoz ? dirname(config.piperRutaVoz) : config.piperRutaBinario ? join(dirname(config.piperRutaBinario), 'voces') : null;
    if (!carpeta || !existsSync(carpeta)) return [];
    let archivos: string[];
    try {
      archivos = readdirSync(carpeta).filter((a) => a.toLowerCase().endsWith('.onnx'));
    } catch {
      return [];
    }
    return archivos.map((archivo) => ({ archivo, ruta: join(carpeta, archivo), etiqueta: this.etiquetaVoz(archivo) }));
  }

  private etiquetaVoz(archivo: string): string {
    const nombre = archivo.replace(/\.onnx$/i, '');
    const match = nombre.match(/^([a-z]{2})_([A-Z]{2})-([a-z0-9]+)-(x_low|low|medium|high)$/);
    if (!match) return nombre;
    const [, , region, voz, calidad] = match;
    const calidades: Record<string, string> = { x_low: 'calidad muy baja', low: 'calidad baja', medium: 'calidad media', high: 'calidad alta' };
    const nombreVoz = voz.charAt(0).toUpperCase() + voz.slice(1);
    return `${nombreVoz} (${region}, ${calidades[calidad] ?? calidad})`;
  }

  /** Sintetiza un texto ya calculado y autorizado a WAV. `length_scale`
   * fijo en 1.0 a proposito: la velocidad de reproduccion la ajusta el
   * navegador sobre el audio ya generado (`HTMLAudioElement.playbackRate`,
   * seccion 7 del pedido -- "Velocidad" configurable sin volver a invocar
   * el motor por cada cambio).
   *
   * Escribe a un ARCHIVO temporal, no a `--output_file -` (stdout): bug
   * real detectado en vivo probando la bateria de voz completa -- Piper
   * necesita poder volver (seek) al inicio del archivo para corregir el
   * tamaño declarado en la cabecera WAV una vez que termino de generar el
   * audio, algo que un pipe/stdout no permite. El resultado por stdout
   * "parece" un WAV valido (cabecera RIFF correcta) pero whisper.cpp
   * alucinaba texto sin ninguna relacion con el audio real -- confirmado
   * comparando byte a byte contra la MISMA sintesis escrita a un archivo
   * real, que transcribe correctamente. El archivo temporal se borra
   * siempre, haya salido bien o mal (seccion 14 del pedido: "no almacenar
   * audio permanentemente"). */
  async sintetizar(config: ConfiguracionIa, texto: string): Promise<ResultadoSintesis> {
    const estado = this.estado(config);
    if (!estado.disponible) return { ok: false, audioWav: null, error: estado.error };
    if (!texto.trim()) return { ok: false, audioWav: null, error: 'Texto vacío.' };

    const carpetaTemp = await mkdtemp(join(tmpdir(), 'sigbo-piper-'));
    const archivoSalida = join(carpetaTemp, 'salida.wav');
    try {
      const resultado = await new Promise<ResultadoSintesis>((resolve) => {
        const temporizador = setTimeout(() => {
          proceso.kill();
          resolve({ ok: false, audioWav: null, error: 'Tiempo de espera agotado' });
        }, config.piperTimeoutMs);

        const proceso = spawn(estado.rutaBinario as string, ['--model', estado.rutaVoz as string, '--output_file', archivoSalida, '--quiet']);
        let errorSalida = '';
        let resuelto = false;

        const finalizar = (r: ResultadoSintesis) => {
          if (resuelto) return;
          resuelto = true;
          clearTimeout(temporizador);
          resolve(r);
        };

        proceso.stderr.on('data', (chunk: Buffer) => (errorSalida += chunk.toString()));
        proceso.on('error', (error) => finalizar({ ok: false, audioWav: null, error: this.mensajeError(error) }));
        proceso.on('close', async (codigo) => {
          if (codigo !== 0) {
            finalizar({ ok: false, audioWav: null, error: `Piper salió con código ${codigo}: ${errorSalida.slice(-300)}` });
            return;
          }
          try {
            const audioWav = await readFile(archivoSalida);
            finalizar({ ok: true, audioWav, error: null });
          } catch (error) {
            finalizar({ ok: false, audioWav: null, error: this.mensajeError(error) });
          }
        });
        proceso.stdin.write(texto);
        proceso.stdin.end();
      });
      return resultado;
    } finally {
      await rm(carpetaTemp, { recursive: true, force: true });
    }
  }

  private mensajeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
  }
}
