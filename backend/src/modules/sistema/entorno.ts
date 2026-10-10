import { HttpException, ServiceUnavailableException } from '@nestjs/common';
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
        if (error) {
          // Nunca se devuelve error.message: trae la linea de comando completa con el script.
          if (error.killed || error.signal) return rechazar(new NoDisponible(`El Programador de tareas de Windows no respondió en ${Math.round(timeoutMs / 1000)} s.`));
          const detalle = String(stderr || '').trim().slice(0, 500);
          return rechazar(new Error(detalle || `PowerShell terminó con error${typeof error.code === 'number' ? ` (código ${error.code})` : ''}.`));
        }
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
    let buffer = Buffer.alloc(largo);
    await archivo.read(buffer, 0, largo, desde);
    // Si se corto en el medio de una linea, se descarta ese pedazo ANTES de decodificar:
    // un corte dentro de un caracter multibyte no debe estropear toda la cola.
    if (desde > 0) {
      const salto = buffer.indexOf(0x0a);
      buffer = salto < 0 ? Buffer.alloc(0) : buffer.subarray(salto + 1);
    }
    const utf8 = buffer.toString('utf8');
    return utf8.includes(String.fromCharCode(0xfffd)) ? buffer.toString('latin1') : utf8;
  } finally {
    await archivo.close();
  }
}

/** Una dependencia externa que falla en una operacion se informa como 503 con el motivo; los 4xx pasan igual. */
export async function conDependencia<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (e) {
    if (e instanceof HttpException) throw e;
    throw new ServiceUnavailableException(e instanceof Error && e.message ? e.message : 'Dependencia no disponible.');
  }
}
