import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';

const RAIZ_UPLOADS = join(process.cwd(), 'uploads');
const RAIZ_PRIVADA = join(process.cwd(), 'private_uploads');

/** Guarda un archivo subido con nombre hasheado dentro de uploads/<carpeta> y devuelve la ruta servible. */
export async function guardarImagen(file: Express.Multer.File, carpeta = 'apariencia'): Promise<string> {
  const extension = extname(file.originalname) || '.png';
  return guardarBuffer(file.buffer, extension, carpeta);
}

/** Guarda un buffer ya generado (ej. un PDF/DOCX armado en memoria) con nombre hasheado. */
export async function guardarBuffer(buffer: Buffer, extension: string, carpeta: string): Promise<string> {
  const destino = join(RAIZ_UPLOADS, carpeta);
  await fs.mkdir(destino, { recursive: true });

  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  const nombreHasheado = `${randomBytes(8).toString('hex')}${ext}`;
  await fs.writeFile(join(destino, nombreHasheado), buffer);

  return `/uploads/${carpeta}/${nombreHasheado}`;
}

/** Guarda evidencia privada fuera del directorio expuesto por Express. */
export async function guardarBufferPrivado(buffer: Buffer, extension: string, carpeta: string): Promise<string> {
  const destino = join(RAIZ_PRIVADA, carpeta);
  await fs.mkdir(destino, { recursive: true });
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  const nombre = `${randomBytes(16).toString('hex')}${ext}`;
  await fs.writeFile(join(destino, nombre), buffer, { flag: 'wx' });
  return nombre;
}

export async function leerBufferPrivado(nombre: string, carpeta: string): Promise<Buffer> {
  if (!/^[a-f0-9]{32}\.[a-z0-9]{2,8}$/i.test(nombre)) throw new Error('Nombre de evidencia inválido');
  return fs.readFile(join(RAIZ_PRIVADA, carpeta, nombre));
}

/** Borra un archivo previamente guardado por guardarImagen, si existe. Nunca lanza. */
export async function borrarImagenSiExiste(
  rutaServida: string | null | undefined,
  carpeta = 'apariencia',
): Promise<void> {
  const prefijo = `/uploads/${carpeta}/`;
  if (!rutaServida || !rutaServida.startsWith(prefijo)) return;
  const nombreArchivo = rutaServida.replace(prefijo, '');
  try {
    await fs.unlink(join(RAIZ_UPLOADS, carpeta, nombreArchivo));
  } catch {
    // el archivo ya no existe o no se pudo borrar: no es critico
  }
}
