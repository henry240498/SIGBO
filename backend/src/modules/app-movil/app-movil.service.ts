import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { closeSync, createReadStream, existsSync, openSync, readFileSync, readSync, statSync } from 'fs';
import { join } from 'path';

export interface VersionAppMovil {
  disponible: boolean;
  versionCodigo?: number;
  versionNombre?: string;
  /** Si es true, la app no deja usarse sin actualizar. */
  obligatoria?: boolean;
  notas?: string;
  tamanioBytes?: number;
  sha256?: string;
  /** Firma Ed25519 (base64) de los datos anteriores, hecha por el cuartel. */
  firma?: string;
}

const MAX_DESCARGAS_SIMULTANEAS = 5;
const REGEX_VERSION = /^\d+\.\d+\.\d+$/;
const REGEX_SHA256 = /^[0-9a-f]{64}$/;

/**
 * Distribucion propia del APK (sin tiendas ni servicios de terceros). El
 * administrador publica con `.movile/scripts/publicar-apk.ps1`, que deja en
 * `APP_MOVIL_DIR` (por defecto `storage/app-movil`) el APK y `version.json`
 * firmado. La app consulta `/app-movil/version` y, si hay una version mayor
 * con firma valida, la descarga de `/app-movil/descargar`.
 *
 * El servidor NO firma nada ni conoce la clave privada: solo sirve lo que el
 * publicador firmo. Y como no puede fiarse de lo que hay en disco, comprueba
 * que el `version.json` describa EXACTAMENTE el APK presente (tamano y hash):
 * si alguien reemplaza el APK sin republicar, se deja de anunciar.
 */
@Injectable()
export class AppMovilService {
  private cacheHash: { clave: string; sha256: string } | null = null;
  private descargasActivas = 0;

  private directorio(): string {
    return process.env.APP_MOVIL_DIR || join(process.cwd(), 'storage', 'app-movil');
  }

  /** Huella del certificado de firma publicada junto al APK (certificado.sha256), si existe. */
  huellaCertificado(): string | null {
    try {
      const texto = readFileSync(join(this.directorio(), 'certificado.sha256'), 'utf8').trim();
      return texto.split(/\s+/)[0] || null;
    } catch {
      return null;
    }
  }

  private rutaApk(): string {
    return join(this.directorio(), 'sigbo-alertas.apk');
  }

  obtenerVersion(): VersionAppMovil {
    const apk = this.rutaApk();
    const meta = join(this.directorio(), 'version.json');
    if (!existsSync(apk) || !existsSync(meta)) return { disponible: false };

    let datos: Record<string, unknown>;
    try {
      datos = JSON.parse(readFileSync(meta, 'utf8').replace(/^﻿/, ''));
    } catch {
      return { disponible: false };
    }
    const codigo = Number(datos.versionCodigo);
    const nombre = datos.versionNombre;
    const sha256Publicado = datos.sha256;
    const firma = datos.firma;
    if (
      !Number.isInteger(codigo) ||
      codigo < 1 ||
      typeof nombre !== 'string' ||
      !REGEX_VERSION.test(nombre) ||
      typeof sha256Publicado !== 'string' ||
      !REGEX_SHA256.test(sha256Publicado) ||
      typeof firma !== 'string' ||
      firma.length === 0
    ) {
      return { disponible: false };
    }

    // El APK en disco debe ser el que se firmo.
    const stat = statSync(apk);
    if (stat.size !== Number(datos.tamanioBytes)) return { disponible: false };
    if (this.hash(apk, `${stat.size}-${stat.mtimeMs}`) !== sha256Publicado) return { disponible: false };

    return {
      disponible: true,
      versionCodigo: codigo,
      versionNombre: nombre,
      obligatoria: datos.obligatoria === true,
      notas: typeof datos.notas === 'string' ? datos.notas : '',
      tamanioBytes: stat.size,
      sha256: sha256Publicado,
      firma,
    };
  }

  /**
   * Abre el APK para descargarlo. Solo se sirve si hay una version valida
   * publicada y se limita la cantidad de descargas en curso (el endpoint es
   * publico y el archivo pesa cientos de MB).
   */
  abrirApk(): { stream: ReturnType<typeof createReadStream>; tamanio: number } {
    if (!this.obtenerVersion().disponible) {
      throw new NotFoundException('No hay una version publicada de la aplicacion movil.');
    }
    if (this.descargasActivas >= MAX_DESCARGAS_SIMULTANEAS) {
      throw new HttpException('Demasiadas descargas en curso; reintente en un momento.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const apk = this.rutaApk();
    const stream = createReadStream(apk);
    this.descargasActivas++;
    let liberada = false;
    const liberar = () => {
      if (liberada) return;
      liberada = true;
      this.descargasActivas--;
    };
    stream.on('close', liberar);
    stream.on('error', liberar);
    return { stream, tamanio: statSync(apk).size };
  }

  /** El hash de un APK de cientos de MB solo se recalcula si el archivo cambia. */
  private hash(ruta: string, clave: string): string {
    if (this.cacheHash?.clave === clave) return this.cacheHash.sha256;
    // Lectura por bloques: el APK puede pesar cientos de MB.
    const h = createHash('sha256');
    const fd = openSync(ruta, 'r');
    try {
      const buffer = Buffer.allocUnsafe(4 * 1024 * 1024);
      let leidos: number;
      while ((leidos = readSync(fd, buffer, 0, buffer.length, null)) > 0) h.update(buffer.subarray(0, leidos));
    } finally {
      closeSync(fd);
    }
    const sha256 = h.digest('hex');
    this.cacheHash = { clave, sha256 };
    return sha256;
  }
}
