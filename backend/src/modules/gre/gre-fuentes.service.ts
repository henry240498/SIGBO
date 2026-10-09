import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { GreDocumento, GrePagina, GreReferencia } from '../../shared/entities';

export const GRE_RAIZ_PRIVADA = 'GRE_RAIZ_PRIVADA';

/** Fuente documental interna. El controlador consumidor debe autorizar antes de leer.
 * No acepta rutas del cliente, no hace descargas y no publica archivos estáticos. */
@Injectable()
export class GreFuentesService {
  constructor(@Inject(GRE_RAIZ_PRIVADA) private readonly raizPrivada: string) {}

  async leerDocumento(documento: Pick<GreDocumento, 'sha256' | 'referenciaPrivada' | 'tamanoBytes'>): Promise<Buffer> {
    if (!/^[a-f0-9]{64}$/.test(documento.sha256)
      || documento.referenciaPrivada !== `privado:gre:${documento.sha256}.pdf`
      || !Number.isSafeInteger(documento.tamanoBytes)
      || documento.tamanoBytes <= 0 || documento.tamanoBytes > 64 * 1024 * 1024) {
      throw new ServiceUnavailableException('La identidad de la fuente GRE es inválida.');
    }
    const raiz = resolve(this.raizPrivada);
    const archivo = join(raiz, `${documento.sha256}.pdf`);
    try {
      // Rechazar enlaces incluso si el nombre coincide; no seguir destinos fuera del almacén.
      const [realRaiz, realArchivo, estado] = await Promise.all([
        fs.realpath(raiz), fs.realpath(archivo), fs.lstat(archivo),
      ]);
      if (realRaiz !== raiz || realArchivo !== archivo || estado.isSymbolicLink()
        || !estado.isFile() || estado.size !== documento.tamanoBytes) {
        throw new ServiceUnavailableException('La fuente GRE no coincide con su almacenamiento privado.');
      }
      const buffer = await fs.readFile(archivo);
      if (buffer.length !== documento.tamanoBytes || buffer.subarray(0, 5).toString('ascii') !== '%PDF-'
        || createHash('sha256').update(buffer).digest('hex') !== documento.sha256) {
        throw new ServiceUnavailableException('La integridad de la fuente GRE no pudo verificarse.');
      }
      return buffer;
    } catch (error: any) {
      if (error instanceof ServiceUnavailableException) throw error;
      if (error?.code === 'ENOENT') throw new NotFoundException('La fuente GRE no está disponible en el almacén privado.');
      throw new ServiceUnavailableException('No se pudo leer la fuente GRE.');
    }
  }

  /** Caja en puntos de la página sin rotar. El visor aplica después page.rotation.
   * La transformación queda identificada; no convertir coordenadas silenciosamente. */
  validarReferencia(referencia: Pick<GreReferencia, 'versionId' | 'paginaPdf' | 'cajaPtJson' | 'sistemaCoordenadas' | 'orientacion' | 'confianza'>,
    pagina: Pick<GrePagina, 'versionId' | 'paginaPdf' | 'anchoPt' | 'altoPt' | 'rotacion'>): void {
    if (referencia.sistemaCoordenadas !== 'PYMUPDF_SIN_ROTAR_PT'
      || referencia.versionId !== pagina.versionId || referencia.paginaPdf !== pagina.paginaPdf
      || !Number.isSafeInteger(pagina.paginaPdf) || pagina.paginaPdf < 1
      || !Number.isFinite(pagina.anchoPt) || !Number.isFinite(pagina.altoPt)
      || pagina.anchoPt <= 0 || pagina.altoPt <= 0
      || ![0, 90, 180, 270].includes(pagina.rotacion)
      || (referencia.orientacion !== null && referencia.orientacion !== pagina.rotacion)
      || (referencia.confianza !== null && (!Number.isFinite(referencia.confianza)
        || referencia.confianza < 0 || referencia.confianza > 1))) {
      throw new ServiceUnavailableException('La referencia GRE no corresponde a su página y versión.');
    }
    if (referencia.cajaPtJson === null) return;
    let caja: unknown;
    try { caja = JSON.parse(referencia.cajaPtJson); } catch {
      throw new ServiceUnavailableException('La caja de procedencia GRE es inválida.');
    }
    if (!Array.isArray(caja) || caja.length !== 4
      || !caja.every(v => typeof v === 'number' && Number.isFinite(v))
      || caja[0] < 0 || caja[1] < 0 || caja[2] <= caja[0] || caja[3] <= caja[1]
      || caja[2] > pagina.anchoPt || caja[3] > pagina.altoPt) {
      throw new ServiceUnavailableException('La caja de procedencia GRE excede su página.');
    }
  }
}
