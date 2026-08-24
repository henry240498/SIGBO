import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join, relative, resolve } from 'path';
import { diskStorage } from 'multer';

const DIRECTORIO_TEMPORAL = join(process.cwd(), 'private_uploads', 'denuncias-ingreso');
const MAX_EDAD_TEMPORAL_MS = 60 * 60 * 1000;

/** Los adjuntos públicos nunca atraviesan la RAM del proceso ni uploads estático. */
export const almacenamientoTemporalDenuncias = diskStorage({
  destination: (_req, _file, done) => {
    fs.mkdir(DIRECTORIO_TEMPORAL, { recursive: true })
      .then(() => done(null, DIRECTORIO_TEMPORAL))
      .catch((error: Error) => done(error, DIRECTORIO_TEMPORAL));
  },
  filename: (_req, _file, done) => {
    done(null, randomBytes(16).toString('hex') + '.upload');
  },
});

type ArchivosDenuncia = {
  audio?: Express.Multer.File[];
  evidencias?: Express.Multer.File[];
};

function esTemporalPropio(ruta: string): boolean {
  const relativo = relative(resolve(DIRECTORIO_TEMPORAL), resolve(ruta));
  return relativo !== '' && !relativo.startsWith('..') && !relativo.includes(':');
}

export async function eliminarArchivosTemporalesDenuncia(archivos: ArchivosDenuncia | undefined): Promise<void> {
  const adjuntos = [...(archivos?.audio ?? []), ...(archivos?.evidencias ?? [])];
  await Promise.all(adjuntos.map(async (archivo) => {
    if (!archivo.path || !esTemporalPropio(archivo.path)) return;
    await fs.rm(archivo.path, { force: true }).catch(() => undefined);
  }));
}

/**
 * Recupera archivos de peticiones abortadas o DTO inválidos sin tocar
 * adjuntos recientes que aún podría estar procesando otra solicitud.
 */
export async function limpiarTemporalesDenuncia(): Promise<void> {
  try {
    const ahora = Date.now();
    const entradas = await fs.readdir(DIRECTORIO_TEMPORAL, { withFileTypes: true });
    await Promise.all(entradas.filter((entrada) => entrada.isFile()).map(async (entrada) => {
      const ruta = join(DIRECTORIO_TEMPORAL, entrada.name);
      const datos = await fs.stat(ruta);
      if (ahora - datos.mtimeMs > MAX_EDAD_TEMPORAL_MS) {
        await fs.rm(ruta, { force: true });
      }
    }));
  } catch {
    // La limpieza es de mejor esfuerzo: no debe impedir una denuncia válida.
  }
}
