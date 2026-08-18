import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { EncabezadoInstitucional } from './identidad-institucional';
import { FirmanteResuelto } from './firmantes-institucionales';

const MARGEN = 40;

const ALINEACION_PDFKIT: Record<'IZQUIERDA' | 'CENTRO' | 'DERECHA', 'left' | 'center' | 'right'> = {
  IZQUIERDA: 'left',
  CENTRO: 'center',
  DERECHA: 'right',
};

function rutaAbsoluta(rutaServida: string | null): string | null {
  if (!rutaServida) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  return existsSync(absoluta) ? absoluta : null;
}

export interface DocumentoPlantillaSnapshot {
  generadoEn: string;
  institucional: EncabezadoInstitucional;
  titulo: string;
  numeroDocumental: string | null;
  fecha: string;
  contenido: string;
  firmante: FirmanteResuelto | null;
}

/** Genera el PDF de un documento creado desde una plantilla (seccion
 * 40 del pedido) -- mismo motor documental (membrete + firmante) que
 * Academia/Guardias/Finanzas, esta vez con el cuerpo ya resuelto
 * (placeholders {{CAMPO}} reemplazados por PlantillasService antes de
 * llegar aca). */
export function generarDocumentoPlantillaPdf(snapshot: DocumentoPlantillaSnapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGEN, size: 'A4', bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ancho = doc.page.width - MARGEN * 2;
    const inst = snapshot.institucional;
    const logoIzq = rutaAbsoluta(inst.logoIzquierdaUrl);
    const logoDer = rutaAbsoluta(inst.logoDerechaUrl);

    function encabezadoInstitucional() {
      const inicio = doc.y;
      const anchoCentro = ancho - 116;
      const xCentro = MARGEN + 58;
      let y = inicio;
      doc.font('Helvetica-Bold').fontSize(11).text(inst.nombreInstitucion || 'CUERPO DE BOMBEROS VOLUNTARIOS', xCentro, y, { width: anchoCentro, align: 'center' });
      y += 14;
      for (const item of inst.lineasDestacadas) {
        doc.font('Helvetica-Bold').fontSize(7).text(item.texto, xCentro, y, { width: anchoCentro, align: 'center', lineGap: 0 });
        y += 9;
      }
      const contacto = [inst.direccion, inst.telefono ? `Tel.: ${inst.telefono}` : null, inst.email, inst.sitioWeb].filter((v): v is string => !!v);
      for (const item of contacto) {
        doc.font('Helvetica').fontSize(6.5).text(item, xCentro, y, { width: anchoCentro, align: 'center', lineGap: 0 });
        y += 8;
      }
      if (logoIzq) {
        try { doc.image(logoIzq, MARGEN, inicio, { fit: [55, 65], align: 'center', valign: 'center' }); } catch { /* imagen invalida: se omite */ }
      }
      if (logoDer) {
        try { doc.image(logoDer, doc.page.width - MARGEN - 55, inicio, { fit: [55, 65], align: 'center', valign: 'center' }); } catch { /* imagen invalida: se omite */ }
      }
      doc.y = Math.max(y, inicio + 66) + 6;
    }

    encabezadoInstitucional();
    // encabezadoInstitucional() posiciona cada linea con un x explicito
    // (xCentro, para esquivar los logos) -- pdfkit deja doc.x en ese valor
    // despues de un text() con x/y explicitos, asi que hay que resetearlo
    // aca o el bloque titulo/numero/fecha hereda ese corrimiento y termina
    // centrado respecto de una caja angosta, no de la pagina completa.
    const alineacion = ALINEACION_PDFKIT[inst.alineacionTitulo] ?? 'center';
    doc.x = MARGEN;
    doc.fontSize(13).font('Helvetica-Bold').text(snapshot.titulo, MARGEN, doc.y, { width: ancho, align: alineacion });
    if (snapshot.numeroDocumental) {
      doc.x = MARGEN;
      doc.fontSize(10).font('Helvetica').text(`N.° ${snapshot.numeroDocumental}`, MARGEN, doc.y, { width: ancho, align: alineacion });
    }
    doc.x = MARGEN;
    doc.fontSize(9).fillColor('#64748b').text(snapshot.fecha, MARGEN, doc.y, { width: ancho, align: alineacion });
    doc.fillColor('#000000');
    doc.moveDown(1.2);

    doc.font('Helvetica').fontSize(11).text(snapshot.contenido, { align: 'justify', lineGap: 3 });

    if (snapshot.firmante) {
      doc.moveDown(3);
      const firma = rutaAbsoluta(snapshot.firmante.firmaDigitalUrl);
      const y = doc.y;
      if (firma) {
        try { doc.image(firma, MARGEN + ancho / 2 - 30, y, { fit: [60, 40], align: 'center', valign: 'center' }); } catch { /* imagen invalida: se omite */ }
      }
      doc.moveTo(MARGEN + ancho / 2 - 80, y + 44).lineTo(MARGEN + ancho / 2 + 80, y + 44).strokeColor('#000000').lineWidth(0.5).stroke();
      const nombre = snapshot.firmante.nombreCompleto ? `${snapshot.firmante.rango ? snapshot.firmante.rango + ' ' : ''}${snapshot.firmante.nombreCompleto}` : '(cargo vacante)';
      doc.font('Helvetica-Bold').fontSize(9).text(nombre, MARGEN, y + 48, { width: ancho, align: 'center' });
      doc.font('Helvetica').fontSize(8).text(snapshot.firmante.etiquetaCargo, MARGEN, y + 60, { width: ancho, align: 'center' });
      doc.y = y + 75;
    }

    doc.moveDown(1);
    doc.fontSize(8).fillColor('#64748b').text(`Generado: ${new Date(snapshot.generadoEn).toLocaleString('es-PY')}`);

    const pie = inst.piePaginaInstitucional;
    if (pie.texto || pie.mostrarNumeroPagina || pie.mostrarGeneradoSigbo) {
      const paginas = doc.bufferedPageRange();
      for (let indice = paginas.start; indice < paginas.start + paginas.count; indice += 1) {
        doc.switchToPage(indice);
        const partes = [pie.texto, pie.mostrarNumeroPagina ? `Pagina ${indice + 1} de ${paginas.count}` : null, pie.mostrarGeneradoSigbo ? 'Generado por SIGBO' : null].filter(Boolean);
        doc.font('Helvetica').fontSize(6).fillColor('#666666').text(partes.join(' - '), MARGEN, doc.page.height - MARGEN + 16, { width: ancho, align: 'center' });
      }
    }

    doc.end();
  });
}
