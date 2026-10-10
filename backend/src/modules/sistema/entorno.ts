import { execFile } from 'child_process';
import { open, stat } from 'fs/promises';
import { join, resolve } from 'path';

/** Algo que este servidor no puede informar (no es Windows, falta una carpeta...): se muestra el motivo. */
export class NoDisponible extends Error {}

export type EjecutorPowerShell = (script: string, timeoutMs?: number) => Promise<string>;
export const EJECUTOR_POWERSHELL = Symbol('EJECUTOR_POWERSHELL');

/** Carpetas del repositorio que el area Sistema lee. El backend corre con cwd = backend/. */
export function directoriosSistema() {
  const raiz = resolve(process.cwd(), '..');
  return {
    respaldos: process.env.SIGBO_RESPALDOS_DIR || join(raiz, 'respaldos'),
    logs: process.env.SIGBO_LOGS_DIR || join(raiz, 'logs'),
    database: process.env.SIGBO_DATABASE_DIR || join(raiz, 'database'),
  };
}

/**
 * Corre un script FIJO de PowerShell (nunca texto del cliente): execFile sin shell,
 * ventana oculta, con tiempo maximo y salida acotada.
 */
export const ejecutarPowerShell: EjecutorPowerShell = (script, timeoutMs = 20_000) => {
  if (process.platform !== 'win32') return Promise.reject(new NoDisponible('Las tareas programadas de Windows solo existen en un servidor Windows.'));
  return new Promise((resolver, rechazar) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) return rechazar(new Error(String(stderr || error.message).trim().slice(0, 500)));
        resolver(String(stdout));
      },
    );
  });
};

/** Ultimos `bytes` de un archivo, decodificados como UTF-8 (o Latin-1 si no lo son). */
export async function leerCola(ruta: string, bytes: number): Promise<string> {
  const info = await stat(ruta);
  const desde = Math.max(0, info.size - bytes);
  const largo = info.size - desde;
  const archivo = await open(ruta, 'r');
  try {
    const buffer = Buffer.alloc(largo);
    await archivo.read(buffer, 0, largo, desde);
    const utf8 = buffer.toString('utf8');
    const texto = utf8.includes('�') ? buffer.toString('latin1') : utf8;
    // Si se corto en el medio de una linea, se descarta ese pedazo.
    return desde > 0 ? texto.slice(texto.indexOf('\n') + 1) : texto;
  } finally {
    await archivo.close();
  }
}
