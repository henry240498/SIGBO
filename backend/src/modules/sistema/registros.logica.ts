/** Lectura segura de los registros del servidor: lista cerrada de archivos y secretos ocultos. */

export const ARCHIVOS_REGISTRO = {
  'backend-out': 'backend-out.log',
  'backend-err': 'backend-err.log',
  'arranque-automatico': 'arranque-automatico.log',
} as const;

export type ClaveRegistro = keyof typeof ARCHIVOS_REGISTRO;

export function esClaveRegistro(x: string): x is ClaveRegistro {
  return Object.prototype.hasOwnProperty.call(ARCHIVOS_REGISTRO, x);
}

const CLAVES_SECRETAS = 'password|passwd|contrase(?:ñ|n)a|secret|secreto|token|api[_-]?key|authorization|cookie|sa_password|sqlcmdpassword|[a-z_]*_password';
const CLAVE_VALOR = new RegExp(`(\\b(?:${CLAVES_SECRETAS})\\b["']?\\s*[=:]\\s*)("[^"]*"|'[^']*'|[^\\s,;&]+)`, 'gi');
/** Van ANTES que clave=valor: si no, "Authorization: Bearer x" ocultaria la palabra Bearer y dejaria x. */
const PATRONES: Array<[RegExp, string]> = [
  [/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [oculto]'],
  [/(sigbo_(?:access|refresh)=)[^;\s]+/gi, '$1[oculto]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt oculto]'],
];

export function ocultarSecretos(linea: string): string {
  const sinTokens = PATRONES.reduce((t, [re, reemplazo]) => t.replace(re, reemplazo), linea);
  return sinTokens.replace(CLAVE_VALOR, (_m: string, clave: string, valor: string) => {
    const comilla = valor.startsWith('"') ? '"' : valor.startsWith("'") ? "'" : '';
    return `${clave}${comilla}[oculto]${comilla}`;
  });
}

const ANSI = /\u001b\[[0-9;]*m/g;

export function ultimasLineas(texto: string, max: number): string[] {
  const lineas = texto.replace(/^﻿/, '').replace(ANSI, '').split(/\r?\n/);
  if (lineas.length && lineas[lineas.length - 1] === '') lineas.pop();
  return lineas.slice(-max);
}

export type NivelLinea = 'ERROR' | 'WARN' | 'LOG' | 'OTRO';

export function nivelDeLinea(linea: string): NivelLinea {
  if (/\bERROR\b|\bError:|\bFALLO\b|Exception\b/.test(linea)) return 'ERROR';
  if (/\bWARN\b|\bAVISO\b|\bATENCI[OÓ]N\b/.test(linea)) return 'WARN';
  if (/\b(LOG|DEBUG|VERBOSE)\b/.test(linea)) return 'LOG';
  return 'OTRO';
}
