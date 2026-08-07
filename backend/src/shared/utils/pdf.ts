import PDFDocument from 'pdfkit';

const MARGEN = 36;
const ALTO_FILA = 20;

function textoCelda(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '';
  if (valor instanceof Date) return valor.toLocaleDateString('es-PY');
  return String(valor);
}

/** Genera un .pdf con una tabla simple (cabecera + filas) y paginacion automatica. */
export function generarPdf(filas: Record<string, unknown>[], titulo: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGEN, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).font('Helvetica-Bold').text(titulo, { align: 'left' });
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Generado: ${new Date().toLocaleString('es-PY')}`, { align: 'left' });
    doc.moveDown(1);
    doc.fillColor('#000000');

    const columnas = filas.length > 0 ? Object.keys(filas[0]) : [];
    const anchoDisponible = doc.page.width - MARGEN * 2;
    const anchoColumna = columnas.length > 0 ? anchoDisponible / columnas.length : anchoDisponible;
    const maxCaracteres = Math.max(6, Math.floor(anchoColumna / 5));

    function dibujarCabecera() {
      const y = doc.y;
      doc.font('Helvetica-Bold').fontSize(8);
      columnas.forEach((c, i) => {
        doc.text(c.slice(0, maxCaracteres), MARGEN + i * anchoColumna, y, {
          width: anchoColumna - 4,
          ellipsis: true,
        });
      });
      doc.moveTo(MARGEN, y + 14).lineTo(MARGEN + anchoDisponible, y + 14).strokeColor('#94a3b8').stroke();
      doc.y = y + 18;
      doc.font('Helvetica').fontSize(8);
    }

    if (columnas.length === 0) {
      doc.fontSize(10).text('Sin datos para exportar.');
      doc.end();
      return;
    }

    dibujarCabecera();

    for (const fila of filas) {
      if (doc.y + ALTO_FILA > doc.page.height - MARGEN) {
        doc.addPage();
        doc.y = MARGEN;
        dibujarCabecera();
      }
      const y = doc.y;
      columnas.forEach((c, i) => {
        doc.text(textoCelda(fila[c]).slice(0, maxCaracteres), MARGEN + i * anchoColumna, y, {
          width: anchoColumna - 4,
          ellipsis: true,
        });
      });
      doc.y = y + ALTO_FILA;
    }

    doc.end();
  });
}
