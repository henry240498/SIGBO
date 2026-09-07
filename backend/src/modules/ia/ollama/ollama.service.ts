import { Injectable, Logger } from '@nestjs/common';
import { ConfiguracionIa } from '../../../shared/entities';

export interface ModeloOllama {
  nombre: string;
  tamanoBytes: number;
}

export interface EstadoOllama {
  conectado: boolean;
  url: string;
  modelosInstalados: ModeloOllama[];
  modeloConfigurado: string | null;
  modeloDisponible: boolean;
  error: string | null;
}

export interface ResultadoPruebaConexion {
  conectado: boolean;
  version: string | null;
  error: string | null;
}

export interface ResultadoPruebaGeneracion {
  ok: boolean;
  respuesta: string | null;
  duracionMs: number | null;
  error: string | null;
}

const PROMPT_REFORMULAR = (texto: string) =>
  `Sos un redactor tecnico. Tu unica tarea es reformular el siguiente resultado en UNA oracion natural en espanol rioplatense, clara y breve.
Reglas estrictas: no agregues ningun dato que no este en el texto. No inventes numeros, nombres ni fechas. No agregues opiniones, advertencias ni comentarios. No agregues comillas. Devolve UNICAMENTE la oracion reformulada, nada mas.

Texto a reformular:
"""
${texto}
"""`;

const PROMPT_SUGERIR = (mensaje: string, nombres: string[]) =>
  `Un usuario de un sistema de gestion de bomberos escribio este mensaje: "${mensaje}"
Elegi CUAL de las siguientes herramientas responde mejor esa consulta. Si el mensaje es un reclamo, una reaccion, un comentario sobre la conversacion, o no pide informacion especifica de ningun tema de la lista, respondé exactamente: NINGUNA
Respondé EXCLUSIVAMENTE con el nombre exacto de una herramienta de esta lista o con NINGUNA, sin explicacion, sin puntuacion, sin comillas.

Ejemplos:
"Que" -> NINGUNA
"Como asi" -> NINGUNA
"Eso no es lo que pregunte" -> NINGUNA
"Cuantos bomberos activos hay" -> get_personal

Herramientas disponibles:
${nombres.map((n) => `- ${n}`).join('\n')}`;

/** Cliente de Ollama LOCAL para Snoopy (Etapa 1 del pedido de integracion).
 * Nunca toca la base de datos, nunca decide autorizacion, nunca ejecuta
 * nada por si solo -- cada metodo devuelve texto/sugerencias que
 * IaMotorService valida o usa como input de un paso ya existente. Ningun
 * metodo lanza: si Ollama no responde, esta apagado o tarda mas del
 * timeout configurado, se devuelve un resultado "vacio" (null/false/texto
 * original) para que el llamador siga funcionando sin Ollama (seccion 19
 * del pedido, "fallback"). */
@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  private base(config: ConfiguracionIa): string {
    return `${config.ollamaUrl}:${config.ollamaPuerto}`;
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

  /** Estado para el panel de administracion (seccion 9 del pedido):
   * conectividad + inventario de modelos instalados vía `GET /api/tags`,
   * la misma API que usa `ollama list`. Timeout corto y fijo (2s): es una
   * consulta de estado, no una generacion -- no debe colgar la pantalla
   * de configuracion si Ollama no esta disponible. */
  async estado(config: ConfiguracionIa): Promise<EstadoOllama> {
    try {
      const res = await this.fetchConTimeout(`${this.base(config)}/api/tags`, { method: 'GET' }, 2000);
      if (!res.ok) return this.estadoDesconectado(config, `Ollama respondió ${res.status}`);
      const cuerpo = (await res.json()) as { models?: Array<{ name: string; size: number }> };
      const modelosInstalados = (cuerpo.models ?? []).map((m) => ({ nombre: m.name, tamanoBytes: m.size }));
      return {
        conectado: true,
        url: this.base(config),
        modelosInstalados,
        modeloConfigurado: config.ollamaModelo,
        modeloDisponible: !!config.ollamaModelo && modelosInstalados.some((m) => m.nombre === config.ollamaModelo),
        error: null,
      };
    } catch (error) {
      return this.estadoDesconectado(config, this.mensajeError(error));
    }
  }

  private estadoDesconectado(config: ConfiguracionIa, error: string): EstadoOllama {
    return { conectado: false, url: this.base(config), modelosInstalados: [], modeloConfigurado: config.ollamaModelo, modeloDisponible: false, error };
  }

  /** Prueba de conexion explicita (seccion 9): `GET /api/version`, aparte
   * de `estado()` porque el panel quiere poder disparar esta prueba a
   * demanda con su propio boton, no solo mostrar el estado de fondo. */
  async probarConexion(config: ConfiguracionIa): Promise<ResultadoPruebaConexion> {
    try {
      const res = await this.fetchConTimeout(`${this.base(config)}/api/version`, { method: 'GET' }, 3000);
      if (!res.ok) return { conectado: false, version: null, error: `Ollama respondió ${res.status}` };
      const cuerpo = (await res.json()) as { version?: string };
      return { conectado: true, version: cuerpo.version ?? null, error: null };
    } catch (error) {
      return { conectado: false, version: null, error: this.mensajeError(error) };
    }
  }

  /** Prueba de generacion real (seccion 9): usa el modelo configurado y
   * el timeout configurado (a diferencia de estado()/probarConexion(),
   * que son chequeos rapidos) -- confirma que el modelo puede generar,
   * no solo que el servidor responde. */
  async probarGeneracion(config: ConfiguracionIa, prompt?: string): Promise<ResultadoPruebaGeneracion> {
    if (!config.ollamaModelo) return { ok: false, respuesta: null, duracionMs: null, error: 'No hay un modelo configurado.' };
    const inicio = Date.now();
    try {
      const res = await this.fetchConTimeout(
        `${this.base(config)}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.ollamaModelo,
            prompt: prompt?.trim() || 'Decí en una oración breve qué sos, en español.',
            stream: false,
            // 30m en vez del default de Ollama (5m): en este tipo de uso
            // (consultas espaciadas durante una jornada, no un chat
            // continuo) el modelo se descarga de memoria seguido y cada
            // primera llamada despues de un rato de inactividad tarda
            // ~15s en vez de ~2-3s -- probado empiricamente contra este
            // mismo modelo en esta maquina.
            keep_alive: '30m',
            options: { temperature: Number(config.ollamaTemperatura) },
          }),
        },
        config.ollamaTimeoutMs,
      );
      const duracionMs = Date.now() - inicio;
      if (!res.ok) return { ok: false, respuesta: null, duracionMs, error: `Ollama respondió ${res.status}` };
      const cuerpo = (await res.json()) as { response?: string };
      return { ok: true, respuesta: cuerpo.response?.trim() ?? '', duracionMs, error: null };
    } catch (error) {
      return { ok: false, respuesta: null, duracionMs: Date.now() - inicio, error: this.mensajeError(error) };
    }
  }

  /** Sugerencia de herramienta cuando el reconocimiento por patrones de
   * IaMotorService no encontro ninguna (seccion 4 del pedido: "ayudar a
   * interpretar y formular la intencion"). La respuesta de Ollama SOLO
   * se acepta si coincide EXACTAMENTE (sin mayusculas/espacios) con uno
   * de los nombres de la lista blanca que se le paso -- cualquier otra
   * cosa (alucinacion, texto extra, un nombre inventado) se descarta y
   * se devuelve null. Ollama nunca elige entre TODAS las herramientas
   * del sistema, solo entre las que el llamador ya filtro por modulo
   * habilitado Y permiso del usuario (esa lista la arma IaMotorService
   * antes de llamar aca, nunca esta funcion). */
  async sugerirHerramienta(config: ConfiguracionIa, mensaje: string, nombresDisponibles: string[]): Promise<string | null> {
    if (!config.ollamaHabilitado || !config.ollamaModelo || nombresDisponibles.length === 0) return null;
    try {
      const res = await this.fetchConTimeout(
        `${this.base(config)}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.ollamaModelo,
            prompt: PROMPT_SUGERIR(mensaje, nombresDisponibles),
            stream: false,
            // 30m en vez del default de Ollama (5m): en este tipo de uso
            // (consultas espaciadas durante una jornada, no un chat
            // continuo) el modelo se descarga de memoria seguido y cada
            // primera llamada despues de un rato de inactividad tarda
            // ~15s en vez de ~2-3s -- probado empiricamente contra este
            // mismo modelo en esta maquina.
            keep_alive: '30m',
            options: { temperature: 0 },
          }),
        },
        config.ollamaTimeoutMs,
      );
      if (!res.ok) return null;
      const cuerpo = (await res.json()) as { response?: string };
      const candidato = (cuerpo.response ?? '').trim().replace(/^["'`]|["'`]$/g, '');
      const coincidencia = nombresDisponibles.find((n) => n.toLowerCase() === candidato.toLowerCase());
      return coincidencia ?? null;
    } catch (error) {
      this.logger.debug(`sugerirHerramienta: ${this.mensajeError(error)}`);
      return null;
    }
  }

  /** Reformula en lenguaje natural un resultado que IaMotorService YA
   * calculo y YA autorizo (seccion 12 del pedido). Nunca recibe el
   * mensaje original del usuario -- solo el texto de respuesta que el
   * tool ya redacto, para que una instruccion maliciosa escrita por el
   * usuario no tenga forma de llegarle a Ollama disfrazada de dato a
   * reformular (mitigacion de prompt injection, seccion 17). Si Ollama
   * esta apagado, no disponible, tarda mas del timeout o devuelve un
   * texto vacio, se devuelve el texto ORIGINAL sin tocar -- Snoopy nunca
   * depende de Ollama para responder. */
  async reformular(config: ConfiguracionIa, texto: string): Promise<{ texto: string; modeloUsado: string | null }> {
    if (!config.ollamaHabilitado || !config.ollamaModelo || !texto.trim()) return { texto, modeloUsado: null };
    try {
      const res = await this.fetchConTimeout(
        `${this.base(config)}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.ollamaModelo,
            prompt: PROMPT_REFORMULAR(texto),
            stream: false,
            // 30m en vez del default de Ollama (5m): en este tipo de uso
            // (consultas espaciadas durante una jornada, no un chat
            // continuo) el modelo se descarga de memoria seguido y cada
            // primera llamada despues de un rato de inactividad tarda
            // ~15s en vez de ~2-3s -- probado empiricamente contra este
            // mismo modelo en esta maquina.
            keep_alive: '30m',
            options: { temperature: Number(config.ollamaTemperatura) },
          }),
        },
        config.ollamaTimeoutMs,
      );
      if (!res.ok) return { texto, modeloUsado: null };
      const cuerpo = (await res.json()) as { response?: string };
      const reformulado = (cuerpo.response ?? '').trim();
      if (!reformulado) return { texto, modeloUsado: null };
      return { texto: reformulado, modeloUsado: config.ollamaModelo };
    } catch (error) {
      this.logger.debug(`reformular: ${this.mensajeError(error)}`);
      return { texto, modeloUsado: null };
    }
  }

  private mensajeError(error: unknown): string {
    if (error instanceof Error && error.name === 'AbortError') return 'Tiempo de espera agotado';
    return error instanceof Error ? error.message : 'Error desconocido';
  }
}
