import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { EncabezadoInstitucional } from './identidad-institucional';
import { FirmanteResuelto } from './firmantes-institucionales';

const MARGEN = 40;

function rutaAbsoluta(rutaServida: string | null): string | null {
  if (!rutaServida) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  return existsSync(absoluta) ? absoluta : null;
}

function valor(v: unknown): string {
  return v === null || v === undefined || v === '' ? '-' : String(v);
}

export interface ComprobanteFinancieroSnapshot {
  generadoEn: string;
  institucional: EncabezadoInstitucional;
  movimiento: {
    tipo: 'INGRESO' | 'EGRESO';
    fecha: string;
    concepto: string;
    importe: number;
    moneda: string;
    clasificacion: string | null;
    origenDestino: string;
    proveedor: string | null;
    personaRelacionada: string | null;
    responsable: string | null;
    observacion: string | null;
    estado: string;
  };
  documento: { tipo: string; numero: string | null; timbrado: string | null } | null;
  firmante: FirmanteResuelto | null;
}

/** Comprobante de un movimiento financiero individual (secciones 6, 8,
 * 10 del pedido de Finanzas): reutiliza el mismo motor documental
 * (membrete institucional + firmante resuelto por cargo) que Academia
 * y Ordenes de Guardia, en vez de armar un generador aislado. */
export function generarComprobanteFinancieroPdf(snapshot: ComprobanteFinancieroSnapshot): Promise<Buffer> {
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

    function campo(etiqueta: string, val: unknown) {
      doc.font('Helvetica-Bold').fontSize(10).text(`${etiqueta}: `, { continued: true });
      doc.font('Helvetica').fontSize(10).text(valor(val));
    }

    encabezadoInstitucional();
    const m = snapshot.movimiento;
    doc.fontSize(13).font('Helvetica-Bold').text(`Comprobante de ${m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}`, { align: 'center' });
    if (m.estado === 'ANULADO') {
      doc.fontSize(11).fillColor('#b91c1c').text('*** ANULADO ***', { align: 'center' });
      doc.fillColor('#000000');
    }
    doc.moveDown(1);

    campo('Fecha', m.fecha);
    campo('Concepto', m.concepto);
    campo('Clasificacion', m.clasificacion);
    campo('Importe', `${m.moneda} ${m.importe.toLocaleString('es-PY')}`);
    campo('Caja/Cuenta', m.origenDestino);
    if (m.proveedor) campo('Proveedor', m.proveedor);
    if (m.personaRelacionada) campo('Persona/Entidad relacionada', m.personaRelacionada);
    if (m.responsable) campo('Responsable', m.responsable);
    if (snapshot.documento) {
      doc.moveDown(0.4);
      campo('Documento respaldatorio', `${snapshot.documento.tipo}${snapshot.documento.numero ? ' N° ' + snapshot.documento.numero : ''}`);
      if (snapshot.documento.timbrado) campo('Timbrado', snapshot.documento.timbrado);
    }
    if (m.observacion) {
      doc.moveDown(0.4);
      campo('Observacion', m.observacion);
    }

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
