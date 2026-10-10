/**
 * Lectura de los respaldos que deja la tarea SIGBO-Respaldo-Diario
 * (workflows/scripts/respaldo-docker.ps1): archivos sigbo_cbvc-AAAAMMDD-HHMMSS.bak con su
 * .sha256, y respaldos/registro.log con una corrida por bloque "[1/5] … RESULTADO: OK|FALLO".
 * El registro no fecha sus entradas: la fecha sale del nombre del archivo.
 */

export const NOMBRE_RESPALDO = /^sigbo_cbvc-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.bak$/;

export interface RespaldoArchivo { nombre: string; fecha: string; tamanioBytes: number; tieneSha256: boolean }

export interface CorridaRespaldo {
  archivo: string | null;
  tamanio: string | null;
  sha256: string | null;
  resultado: 'OK' | 'FALLO' | 'INCOMPLETA';
  pruebaRestauracion: 'OMITIDA' | 'OK' | 'FALLO' | 'DESCONOCIDA';
  detalleRestauracion: string | null;
  avisos: string[];
}

export interface AlertaSistema { nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }

/** Solo un nombre de respaldo exacto: nunca una ruta (lo elige el cliente). */
export function validarNombreRespaldo(nombre: unknown): boolean {
  return typeof nombre === 'string' && NOMBRE_RESPALDO.test(nombre);
}

export function fechaDeRespaldo(nombre: string): string | null {
  const m = nombre.match(NOMBRE_RESPALDO);
  if (!m) return null;
  const [a, me, d, h, mi, s] = m.slice(1);
  return `${a}-${me}-${d}T${h}:${mi}:${s}`;
}

const nueva = (): CorridaRespaldo => ({
  archivo: null, tamanio: null, sha256: null, resultado: 'INCOMPLETA', pruebaRestauracion: 'DESCONOCIDA', detalleRestauracion: null, avisos: [],
});

export function parsearRegistro(texto: string): CorridaRespaldo[] {
  const corridas: CorridaRespaldo[] = [];
  let actual: CorridaRespaldo | null = null;
  for (const cruda of texto.replace(/^﻿/, '').split(/\r?\n/)) {
    const linea = cruda.trim();
    if (!linea || /^===\s/.test(linea)) continue;
    if (/^\[1\/5\]/.test(linea)) {
      if (actual) corridas.push(actual);
      actual = nueva();
      continue;
    }
    if (!actual) actual = nueva();
    let m: RegExpMatchArray | null;
    if ((m = linea.match(/^\[4\/5\]\s*(.*)$/))) {
      if (/omitid/i.test(m[1])) actual.pruebaRestauracion = 'OMITIDA';
    } else if ((m = linea.match(/^Restauraci[oó]n correcta:?\s*(.*)$/i))) {
      actual.pruebaRestauracion = 'OK';
      actual.detalleRestauracion = m[1] || null;
    } else if (/restauraci[oó]n/i.test(linea) && /(fall|error)/i.test(linea)) {
      actual.pruebaRestauracion = 'FALLO';
      actual.detalleRestauracion = linea;
    } else if ((m = linea.match(/^Respaldo listo:\s*(.+?)\s*\(([^)]+)\)\s*$/))) {
      actual.archivo = m[1].split(/[\\/]/).pop() ?? m[1];
      actual.tamanio = m[2];
    } else if ((m = linea.match(/^SHA-256:\s*([0-9a-fA-F]{64})/))) {
      actual.sha256 = m[1].toLowerCase();
    } else if ((m = linea.match(/^RESULTADO:\s*(OK|FALLO)/))) {
      actual.resultado = m[1] as 'OK' | 'FALLO';
      corridas.push(actual);
      actual = null;
    } else if (/^(AVISO|ATENCI[OÓ]N)\b/i.test(linea)) {
      actual.avisos.push(linea);
    }
  }
  if (actual) corridas.push(actual);
  return corridas;
}

const legible = (fechaLocal: string) => {
  const [f, h] = fechaLocal.split('T');
  const [a, m, d] = f.split('-');
  return `${d}/${m}/${a} ${h.slice(0, 5)}`;
};

export function alertasRespaldo(archivos: RespaldoArchivo[], corridas: CorridaRespaldo[], ahora: Date): AlertaSistema[] {
  const alertas: AlertaSistema[] = [];
  const ultimo = [...archivos].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (!ultimo) {
    alertas.push({ nivel: 'critica', mensaje: 'No hay ningún respaldo en la carpeta de respaldos.' });
  } else if (ahora.getTime() - new Date(ultimo.fecha).getTime() > 24 * 3_600_000) {
    alertas.push({ nivel: 'critica', mensaje: `El último respaldo es del ${legible(ultimo.fecha)}: pasaron más de 24 horas.` });
  }
  const ultima = corridas[corridas.length - 1];
  if (ultima?.resultado === 'FALLO') alertas.push({ nivel: 'critica', mensaje: 'La última corrida del respaldo terminó con FALLO. Revisar el registro.' });
  if (ultima?.resultado === 'INCOMPLETA') alertas.push({ nivel: 'advertencia', mensaje: 'La última corrida del respaldo no terminó (no hay RESULTADO en el registro).' });
  if (!corridas.some((c) => c.pruebaRestauracion === 'OK')) {
    alertas.push({ nivel: 'advertencia', mensaje: 'Nunca se probó restaurar un respaldo. La tarea lo hace los domingos (-ProbarRestauracion).' });
  }
  const sinHash = archivos.filter((a) => !a.tieneSha256);
  if (sinHash.length) alertas.push({ nivel: 'advertencia', mensaje: `${sinHash.length} respaldo(s) sin su archivo .sha256: no se puede verificar su integridad.` });
  return alertas;
}
