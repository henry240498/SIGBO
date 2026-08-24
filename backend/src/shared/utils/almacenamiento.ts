import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';

const RAIZ_UPLOADS = join(process.cwd(), 'uploads');
const RAIZ_PRIVADA = join(process.cwd(), 'private_uploads');

/** Constantes de carpeta compartidas entre el alta (guardarImagen) y el
 * borrado (borrarImagenSiExiste) de cada recurso -- evitar retipear el
 * string en cada call site previene archivos huerfanos por un typo. */
export const CARPETA_IDENTIDAD_INSTITUCIONAL = 'identidad-institucional';
export const CARPETA_FIRMAS_BOMBERO = 'firmas-bomberos';
export const CARPETA_CERTIFICACIONES = 'certificaciones';
export const CARPETA_DOCUMENTOS = 'documentos';
export const CARPETA_COMPROBANTES_FINANZAS = 'comprobantes-finanzas';
/** Documentos que requieren autorización y nunca deben resolverse desde la URL estática. */
export const CARPETAS_UPLOADS_RESTRINGIDAS = new Set([
  'fojas-servicio',
  'ordenes-guardia',
  'importaciones-marcador',
  'firmas-bomberos',
  'perfiles',
]);

type ImagenDetectada = {
  extension: '.png' | '.jpg' | '.webp' | '.gif';
};

function carpetaSegura(carpeta: string): string {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(carpeta)) {
    throw new Error('Carpeta de almacenamiento inválida');
  }
  // Las rutas de archivos son sensibles a mayusculas en algunos sistemas y
  // Express puede recibir variantes de casing incluso cuando el volumen no lo
  // es. Canonicalizar evita que una carpeta restringida evada sus controles.
  return carpeta.toLowerCase();
}

function extensionSegura(extension: string): string {
  const normalizada = extension.startsWith('.') ? extension : `.${extension}`;
  if (!/^\.[a-z0-9]{1,8}$/i.test(normalizada)) {
    throw new Error('Extensión de almacenamiento inválida');
  }
  return normalizada.toLowerCase();
}

/**
 * Detecta los formatos de imagen que SIGBO sirve públicamente a partir de su
 * cabecera binaria. El MIME y la extensión declarados por el cliente no son
 * confiables y no se usan para decidir qué se guarda.
 */
export function detectarImagen(buffer: Buffer): ImagenDetectada | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: '.png' };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: '.jpg' };
  }
  if (buffer.length >= 6 && (buffer.subarray(0, 6).equals(Buffer.from('GIF87a')) || buffer.subarray(0, 6).equals(Buffer.from('GIF89a')))) {
    return { extension: '.gif' };
  }
  if (buffer.length >= 12 && buffer.subarray(0, 4).equals(Buffer.from('RIFF')) && buffer.subarray(8, 12).equals(Buffer.from('WEBP'))) {
    return { extension: '.webp' };
  }
  return null;
}

/** Guarda un archivo subido con nombre hasheado dentro de uploads/<carpeta> y devuelve la ruta servible. */
export async function guardarImagen(file: Express.Multer.File, carpeta = 'apariencia'): Promise<string> {
  const imagen = detectarImagen(file?.buffer);
  if (!imagen) {
    throw new BadRequestException('El contenido del archivo no corresponde a una imagen PNG, JPG, WEBP o GIF válida');
  }
  return guardarBuffer(file.buffer, imagen.extension, carpeta);
}

/** Guarda una imagen sensible fuera del directorio estático. */
export async function guardarImagenRestringida(file: Express.Multer.File, carpeta: string): Promise<string> {
  const imagen = detectarImagen(file?.buffer);
  if (!imagen) {
    throw new BadRequestException('El contenido del archivo no corresponde a una imagen PNG, JPG, WEBP o GIF válida');
  }
  return guardarBufferRestringido(file.buffer, imagen.extension, carpeta);
}

/** Guarda un buffer ya generado (ej. un PDF/DOCX armado en memoria) con nombre hasheado. */
export async function guardarBuffer(buffer: Buffer, extension: string, carpeta: string): Promise<string> {
  const carpetaValidada = carpetaSegura(carpeta);
  const ext = extensionSegura(extension);
  const destino = join(RAIZ_UPLOADS, carpetaValidada);
  await fs.mkdir(destino, { recursive: true });

  for (let intento = 0; intento < 3; intento++) {
    const nombreHasheado = `${randomBytes(8).toString('hex')}${ext}`;
    try {
      await fs.writeFile(join(destino, nombreHasheado), buffer, { flag: 'wx' });
      return `/uploads/${carpetaValidada}/${nombreHasheado}`;
    } catch (error: any) {
      if (error?.code !== 'EEXIST') throw error;
    }
  }

  throw new Error('No se pudo reservar un nombre único para el archivo');
}

/** Guarda evidencia privada fuera del directorio expuesto por Express. */
export async function guardarBufferPrivado(buffer: Buffer, extension: string, carpeta: string): Promise<string> {
  const carpetaValidada = carpetaSegura(carpeta);
  const ext = extensionSegura(extension);
  const destino = join(RAIZ_PRIVADA, carpetaValidada);
  await fs.mkdir(destino, { recursive: true });
  const nombre = `${randomBytes(16).toString('hex')}${ext}`;
  await fs.writeFile(join(destino, nombre), buffer, { flag: 'wx' });
  return nombre;
}

/** Guarda documentos no públicos fuera de uploads y conserva una referencia
 * opaca compatible con columnas históricamente llamadas *Url. */
export async function guardarBufferRestringido(buffer: Buffer, extension: string, carpeta: string): Promise<string> {
  const carpetaValidada = carpetaSegura(carpeta);
  if (!CARPETAS_UPLOADS_RESTRINGIDAS.has(carpetaValidada)) {
    throw new Error('La carpeta no está configurada como restringida');
  }
  const nombre = await guardarBufferPrivado(buffer, extension, carpetaValidada);
  return `privado:${carpetaValidada}:${nombre}`;
}

export async function leerBufferPrivado(nombre: string, carpeta: string): Promise<Buffer> {
  const carpetaValidada = carpetaSegura(carpeta);
  if (!/^[a-f0-9]{32}\.[a-z0-9]{2,8}$/i.test(nombre)) throw new Error('Nombre de evidencia inválido');
  return fs.readFile(join(RAIZ_PRIVADA, carpetaValidada, nombre));
}

/** Lee un documento heredado del área estática solo después de que su
 * controlador haya autorizado la descarga. No acepta rutas arbitrarias. */
export async function leerBufferPublicadoRestringido(rutaServida: string, carpeta: string): Promise<Buffer> {
  const carpetaValidada = carpetaSegura(carpeta);
  if (!CARPETAS_UPLOADS_RESTRINGIDAS.has(carpetaValidada)) {
    throw new Error('La carpeta no está configurada como restringida');
  }
  const prefijo = `/uploads/${carpetaValidada}/`;
  if (!rutaServida.startsWith(prefijo)) throw new Error('Ruta de documento inválida');
  const nombre = rutaServida.slice(prefijo.length);
  if (!/^[a-f0-9]{16}\.[a-z0-9]{1,8}$/i.test(nombre)) throw new Error('Nombre de documento inválido');
  return fs.readFile(join(RAIZ_UPLOADS, carpetaValidada, nombre));
}

/** Lee tanto la referencia privada actual como archivos legados guardados
 * antes de separar estas carpetas del sitio estático. */
export async function leerBufferRestringido(referencia: string, carpeta: string): Promise<Buffer> {
  const carpetaValidada = carpetaSegura(carpeta);
  const prefijoPrivado = `privado:${carpetaValidada}:`;
  if (referencia.startsWith(prefijoPrivado)) {
    const nombre = referencia.slice(prefijoPrivado.length);
    return leerBufferPrivado(nombre, carpetaValidada);
  }
  return leerBufferPublicadoRestringido(referencia, carpetaValidada);
}

/** Resuelve referencias de archivos para tareas internas (por ejemplo PDFKit),
 * sin exponerlas por HTTP ni aceptar segmentos de ruta arbitrarios. */
export function rutaAbsolutaAlmacenamiento(referencia: string | null | undefined): string | null {
  if (!referencia) return null;
  const privada = /^privado:([a-z0-9][a-z0-9-]{0,63}):([a-f0-9]{32}\.[a-z0-9]{1,8})$/i.exec(referencia);
  if (privada) {
    const [, carpetaOriginal, nombre] = privada;
    const carpeta = carpetaOriginal.toLowerCase();
    if (!CARPETAS_UPLOADS_RESTRINGIDAS.has(carpeta)) return null;
    return join(RAIZ_PRIVADA, carpeta, nombre);
  }
  const publica = /^\/uploads\/([a-z0-9][a-z0-9-]{0,63})\/([a-f0-9]{16}\.[a-z0-9]{1,8})$/i.exec(referencia);
  if (!publica) return null;
  return join(RAIZ_UPLOADS, publica[1].toLowerCase(), publica[2]);
}

export function mimeImagenPorReferencia(referencia: string): string | null {
  switch (extname(referencia).toLowerCase()) {
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    default: return null;
  }
}

/** Indica si una solicitud bajo /uploads intenta acceder a un documento privado. */
export function esRutaUploadRestringida(ruta: string): boolean {
  const carpeta = ruta.replace(/^[/\\]+/, '').split(/[\\/]/, 1)[0].toLowerCase();
  return CARPETAS_UPLOADS_RESTRINGIDAS.has(carpeta);
}

/** Borra un archivo previamente guardado por guardarImagen, si existe. Nunca lanza. */
export async function borrarImagenSiExiste(
  rutaServida: string | null | undefined,
  carpeta = 'apariencia',
): Promise<void> {
  const carpetaValidada = carpetaSegura(carpeta);
  const prefijoPrivado = `privado:${carpetaValidada}:`;
  if (rutaServida?.startsWith(prefijoPrivado)) {
    const nombreArchivo = rutaServida.slice(prefijoPrivado.length);
    if (!/^[a-f0-9]{32}\.[a-z0-9]{1,8}$/i.test(nombreArchivo)) return;
    try {
      await fs.unlink(join(RAIZ_PRIVADA, carpetaValidada, nombreArchivo));
    } catch {
      // el archivo ya no existe o no se pudo borrar: no es crítico
    }
    return;
  }
  const prefijo = `/uploads/${carpetaValidada}/`;
  if (!rutaServida || !rutaServida.startsWith(prefijo)) return;
  const nombreArchivo = rutaServida.slice(prefijo.length);
  if (!/^[a-f0-9]{16}\.[a-z0-9]{1,8}$/i.test(nombreArchivo)) return;
  try {
    await fs.unlink(join(RAIZ_UPLOADS, carpetaValidada, nombreArchivo));
  } catch {
    // el archivo ya no existe o no se pudo borrar: no es critico
  }
}
