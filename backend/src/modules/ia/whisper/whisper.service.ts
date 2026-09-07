import { Injectable, Logger } from '@nestjs/common';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import { ConfiguracionIa } from '../../../shared/entities';

export interface EstadoWhisper {
  conectado: boolean;
  url: string;
  error: string | null;
}

export interface ResultadoTranscripcion {
  ok: boolean;
  texto: string | null;
  error: string | null;
}

/** Cliente de whisper.cpp LOCAL para el "oido" de Snoopy (Etapa 2, seccion
 * 3 del pedido de voz). Misma excepcion acotada que Ollama/Piper: corre en
 * la misma maquina/red local via `whisper-server.exe`, sin llamadas
 * salientes. Unica responsabilidad: audio -> texto. No decide nada, no
 * toca la base, no autoriza nada -- el texto resultante entra al MISMO
 * flujo de `IaMotorService.procesar()` que un mensaje escrito, con las
 * mismas verificaciones (seccion 10 del pedido: "no crear una via
 * alternativa que saltee autenticacion/autorizacion"). Ningun metodo
 * lanza: si whisper-server no responde, esta apagado o tarda mas del
 * timeout, se devuelve un resultado "vacio" para que el llamador ofrezca
 * seguir por texto (seccion 13, fallback). */
@Injectable()
export class WhisperService {
  private readonly logger = new Logger(WhisperService.name);

  private base(config: ConfiguracionIa): string {
    return `${config.whisperUrl}:${config.whisperPuerto}`;
  }

  private async fetchConTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controlador.signal });
    } finally {
      clearTimeout(temporizador);
    }
  }

  /** Estado para el panel de administracion: conectividad con
   * whisper-server. A diferencia de Ollama, whisper.cpp no tiene un
   * endpoint de "modelos instalados" -- el modelo se carga UNA vez al
   * arrancar el servidor por linea de comando, no es seleccionable en
   * caliente por HTTP. */
  async estado(config: ConfiguracionIa): Promise<EstadoWhisper> {
    try {
      const res = await this.fetchConTimeout(`${this.base(config)}/`, { method: 'GET' }, 2000);
      // whisper-server responde 200 en "/" (sirve una pagina html minima) o
      // 404 si esa ruta no existe en esta build -- ambas cosas prueban que
      // el proceso esta vivo y escuchando; solo un error de red es "apagado".
      return { conectado: res.status < 500, url: this.base(config), error: null };
    } catch (error) {
      return { conectado: false, url: this.base(config), error: this.mensajeError(error) };
    }
  }

  /** Convierte lo que grabo el navegador (webm/opus vía MediaRecorder,
   * nunca WAV -- ningun navegador lo ofrece nativamente) a WAV 16kHz mono
   * PCM, el unico formato que el binario de whisper.cpp para Windows sabe
   * leer (no trae un demuxer de contenedores comprimidos). Corre 100% en
   * el mismo proceso/maquina, vía el binario que trae `ffmpeg-static` --
   * no es una llamada de red, no sale de la instalacion. */
  private convertirAWav(bufferEntrada: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const proceso = spawn(ffmpegPath as unknown as string, ['-i', 'pipe:0', '-ar', '16000', '-ac', '1', '-f', 'wav', 'pipe:1']);
      const trozosSalida: Buffer[] = [];
      let errorSalida = '';
      proceso.stdout.on('data', (chunk: Buffer) => trozosSalida.push(chunk));
      proceso.stderr.on('data', (chunk: Buffer) => (errorSalida += chunk.toString()));
      proceso.on('error', reject);
      proceso.on('close', (codigo) => {
        if (codigo === 0 && trozosSalida.length > 0) resolve(Buffer.concat(trozosSalida));
        else reject(new Error(`ffmpeg salio con codigo ${codigo}: ${errorSalida.slice(-300)}`));
      });
      proceso.stdin.write(bufferEntrada);
      proceso.stdin.end();
    });
  }

  /** Transcribe un audio grabado por el usuario (seccion 3 del pedido de
   * voz). SOLO convierte audio a texto -- el texto resultante se entrega
   * tal cual al llamador, que lo pasa por el mismo `/ia/chat` de siempre
   * (mismo permiso, misma auditoria, mismo motor). */
  async transcribir(config: ConfiguracionIa, audioOriginal: Buffer): Promise<ResultadoTranscripcion> {
    try {
      const wav = await this.convertirAWav(audioOriginal);
      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(wav)], { type: 'audio/wav' }), 'audio.wav');
      formData.append('language', config.vozIdioma || 'es');
      formData.append('response_format', 'json');

      const res = await this.fetchConTimeout(`${this.base(config)}/inference`, { method: 'POST', body: formData }, config.whisperTimeoutMs);
      if (!res.ok) return { ok: false, texto: null, error: `whisper-server respondió ${res.status}` };
      const cuerpo = (await res.json()) as { text?: string };
      const texto = (cuerpo.text ?? '').trim();
      if (!texto) return { ok: false, texto: null, error: 'No se detectó ningún texto en el audio.' };
      return { ok: true, texto, error: null };
    } catch (error) {
      this.logger.debug(`transcribir: ${this.mensajeError(error)}`);
      return { ok: false, texto: null, error: this.mensajeError(error) };
    }
  }

  private mensajeError(error: unknown): string {
    if (error instanceof Error && error.name === 'AbortError') return 'Tiempo de espera agotado';
    return error instanceof Error ? error.message : 'Error desconocido';
  }
}
