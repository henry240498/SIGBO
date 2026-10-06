import { Injectable, Logger } from '@nestjs/common';

/** Tiempo maximo de espera a Telegram: un aviso externo nunca debe demorar una emergencia. */
const TIMEOUT_MS = 5000;
const MAX_LARGO = 3500;

/**
 * Avisos opcionales a un grupo o canal de Telegram (API de bots, abierta y gratuita).
 *
 * - Sin TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID no hace nada: es opt-in del cuartel.
 * - Nunca lanza ni espera de mas: si Telegram no responde, la operacion que lo
 *   pidio (crear una alerta o una convocatoria) sigue como si nada.
 * - Nunca escribe el token en los registros.
 * - Es solo un AVISO: las respuestas ("voy") siguen entrando por la app, donde
 *   hay usuario, permisos y auditoria.
 */
@Injectable()
export class TelegramService {
  private readonly log = new Logger('Telegram');

  habilitado(): boolean {
    return !!process.env.TELEGRAM_BOT_TOKEN?.trim() && !!process.env.TELEGRAM_CHAT_ID?.trim();
  }

  /** Devuelve true si Telegram aceptó el mensaje. */
  async enviar(texto: string): Promise<boolean> {
    if (!this.habilitado()) return false;
    const token = process.env.TELEGRAM_BOT_TOKEN!.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID!.trim();
    const cuerpo = texto.length > MAX_LARGO ? `${texto.slice(0, MAX_LARGO)}…` : texto;
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: cuerpo, disable_web_page_preview: true }),
        signal: control.signal,
      });
      if (!res.ok) {
        this.log.warn(`Telegram respondio ${res.status}; el aviso no se envio.`);
        return false;
      }
      return true;
    } catch (error) {
      const motivo = error instanceof Error && error.name === 'AbortError' ? 'tiempo de espera agotado' : 'error de red';
      this.log.warn(`No se pudo enviar el aviso a Telegram (${motivo}).`);
      return false;
    } finally {
      clearTimeout(temporizador);
    }
  }

  /** Para llamar sin esperar: el aviso va en segundo plano y no afecta a quien lo pidio. */
  enviarEnSegundoPlano(texto: string): void {
    void this.enviar(texto);
  }
}
