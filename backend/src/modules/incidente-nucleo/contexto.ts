import type { Request } from 'express';
import type { OrigenEvento } from '../../shared/entities';

/** La app Android manda `X-SIGBO-Dispositivo: movil` (la misma cabecera que reconoce el CSRF y el login). */
export function origenDe(req: Request): OrigenEvento {
  return req.headers['x-sigbo-dispositivo'] === 'movil' ? 'APP' : 'WEB';
}

/** Equipo desde el que se hizo la accion: su User-Agent (la cabecera de la app siempre dice "movil"). */
export function dispositivoDe(req: Request): string | null {
  const valor = req.headers['user-agent'];
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto ? String(texto).slice(0, 200) : null;
}