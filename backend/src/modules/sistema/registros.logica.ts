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

const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;

/**
 * Clave que contiene una palabra sensible, aunque tenga prefijo o sufijo (JWT_SECRET, access_token,
 * DB_PASSWORD). Sin \b: el guion bajo cuenta como letra para \b y dejaba pasar "JWT_SECRET=abc".
 */
const CLAVE = '[A-Za-z0-9_-]*(?:password|passwd|pwd|secret|token|api[_-]?key|contrase(?:ñ|n)a)[A-Za-z0-9_-]*';
const VALOR_IGUAL = `"[^"]*"|'[^']*'|[^\\s,;&]+`;
/** Con ":" el valor sin comillas llega hasta el fin de la línea, ";", "," o una llave. */
const VALOR_DOS_PUNTOS = `"[^"]*"|'[^']*'|[^,;\\r\\n"'}]+`;
const ASIGNACION_IGUAL = new RegExp(`(${CLAVE}["']?\\s*=\\s*)(${VALOR_IGUAL})`, 'gi');
const ASIGNACION_DOS_PUNTOS = new RegExp(`(${CLAVE}["']?\\s*:\\s*)(${VALOR_DOS_PUNTOS})`, 'gi');

/** Van ANTES que clave=valor: sus valores tienen espacios y se ocultan hasta el fin de la línea. */
const CABECERAS: Array<[RegExp, string]> = [
  [/(authorization\s*:)[^\r\n]*/gi, '$1 [oculto]'],
  [/((?:set-)?cookie\s*:)[^\r\n]*/gi, '$1 [oculto]'],
  [/\b(Bearer|Basic)\s+[A-Za-z0-9\-._~+/]+=*/gi, '$1 [oculto]'],
  [/(sigbo_(?:access|refresh)=)[^;\s]+/gi, '$1[oculto]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt oculto]'],
  [/([a-z][a-z0-9+.-]*:\/\/)([^\s:/@]+):([^\s@/]+)@/gi, '$1$2:[oculto]@'],
];

export function ocultarSecretos(linea: string): string {
  const sinColores = linea.replace(ANSI, '');
  const sinCabeceras = CABECERAS.reduce((t, [re, reemplazo]) => t.replace(re, reemplazo), sinColores);
  const sinIgual = sinCabeceras.replace(ASIGNACION_IGUAL, (_m: string, clave: string, valor: string) => {
    const comilla = valor.startsWith('"') ? '"' : valor.startsWith("'") ? "'" : '';
    return `${clave}${comilla}[oculto]${comilla}`;
  });
  return sinIgual.replace(ASIGNACION_DOS_PUNTOS, (_m: string, clave: string, valor: string) => {
    const comilla = valor.startsWith('"') ? '"' : valor.startsWith("'") ? "'" : '';
    return `${clave}${comilla}[oculto]${comilla}`;
  });
}

export function ultimasLineas(texto: string, max: number): string[] {
  if (!(max > 0)) return [];
  const lineas = texto.replace(/^\uFEFF/, '').replace(ANSI, '').split(/\r?\n/);
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
