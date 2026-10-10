import { basename, dirname, extname, relative, resolve, isAbsolute } from 'path';

/**
 * La ruta del binario de Piper se configura desde la web. Sin acotarla, quien tuviera
 * inteligencia:configurar podia hacer que el servidor ejecutara cualquier programa del
 * disco (PiperService la pasa a spawn). Solo se acepta un ejecutable llamado piper o
 * piper.exe, y la voz .onnx, dentro de una carpeta permitida.
 */
const NOMBRES_BINARIO = new Set(['piper', 'piper.exe']);

export function carpetaPermitidaPiper(guardada: string | null): string | null {
  const env = process.env.IA_PIPER_DIR?.trim();
  if (env) return resolve(env);
  return guardada ? resolve(dirname(guardada)) : null;
}

function dentroDe(carpeta: string, ruta: string): boolean {
  const rel = relative(resolve(carpeta), resolve(ruta));
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

export function validarRutasPiper(rutaBinario: string | null, rutaVoz: string | null, carpetaPermitida: string | null): string | null {
  if (!rutaBinario && !rutaVoz) return null;
  if (!carpetaPermitida) return 'No hay carpeta permitida para Piper: definir IA_PIPER_DIR en el .env del backend.';
  if (rutaBinario) {
    if (!NOMBRES_BINARIO.has(basename(rutaBinario).toLowerCase())) return 'El ejecutable debe llamarse piper o piper.exe.';
    if (!dentroDe(carpetaPermitida, rutaBinario)) return `El ejecutable de Piper debe estar dentro de la carpeta permitida (${carpetaPermitida}).`;
  }
  if (rutaVoz) {
    if (extname(rutaVoz).toLowerCase() !== '.onnx') return 'La voz debe ser un archivo .onnx.';
    if (!dentroDe(carpetaPermitida, rutaVoz)) return `La voz debe estar dentro de la carpeta permitida (${carpetaPermitida}).`;
  }
  return null;
}
