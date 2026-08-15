import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { ReporteActividadSnapshot } from '../../modules/academia/types/reporte-actividad-snapshot';

const MARGEN = 40;

function rutaAbsoluta(rutaServida: string | null): string | null {
  if (!rutaServida) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  return existsSync(absoluta) ? absoluta : null;
}

function valor(v: unknown): string {
  return v === null || v === undefined || v === '' ? '-' : String(v);
}

/** PDF del reporte de una actividad academica -- reutiliza el mismo motor
 * documental (membrete institucional + firmante resuelto) que Ordenes de
 * Guardia, en vez de armar un generador aislado (seccion 28 del pedido). */
export function generarReporteActividadAcademicaPdf(snapshot: ReporteActividadSnapshot): Promise<Buffer> {
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

    function seccion(titulo: string) {
      doc.moveDown(0.6);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a8a').text(titulo);
      doc.moveTo(MARGEN, doc.y + 2).lineTo(MARGEN + ancho, doc.y + 2).strokeColor('#94a3b8').stroke();
      doc.moveDown(0.4);
      doc.fillColor('#000000').font('Helvetica').fontSize(10);
    }

    function campo(etiqueta: string, val: unknown) {
      doc.font('Helvetica-Bold').text(`${etiqueta}: `, { continued: true });
      doc.font('Helvetica').text(valor(val));
    }

    encabezadoInstitucional();
    doc.fontSize(13).font('Helvetica-Bold').text('Reporte de Actividad Academica', { align: 'center' });
    doc.moveDown(0.3);

    const a = snapshot.actividad;
    seccion('Datos de la actividad');
    campo('Nombre', a.nombre);
    campo('Codigo', a.codigo);
    campo('Tipo', a.tipo);
    campo('Modalidad', a.modalidad);
    campo('Periodo', `${a.fechaInicio} - ${a.fechaFin}`);
    campo('Lugar', a.lugar);
    campo('Carga horaria', a.duracionHoras ? `${a.duracionHoras} hs` : null);
    campo('Estado', a.estado);
    campo('Capacitacion externa', a.esExterna ? 'Si' : 'No');
    if (a.descripcion) { doc.moveDown(0.2); campo('Descripcion', a.descripcion); }
    if (a.objetivo) { doc.moveDown(0.2); campo('Objetivo', a.objetivo); }

    seccion('Instructores');
    if (snapshot.instructores.length === 0) doc.text('Sin instructores asignados.');
    for (const i of snapshot.instructores) {
      doc.text(`- ${i.nombreCompleto} (${i.tipo === 'PERSONAL' ? 'Personal' : 'Externo'}, ${i.rolInstructor})${i.detalle ? ' - ' + i.detalle : ''}`);
    }

    seccion('Indicadores');
    campo('Total de participantes', snapshot.indicadores.totalParticipantes);
    for (const [estado, cant] of Object.entries(snapshot.indicadores.porEstado)) campo(`Estado: ${estado}`, cant);
    for (const [resultado, cant] of Object.entries(snapshot.indicadores.porResultado)) campo(`Resultado: ${resultado}`, cant);

    seccion('Participantes');
    if (snapshot.participantes.length === 0) doc.text('Sin participantes inscritos.');
    for (const p of snapshot.participantes) {
      doc.fontSize(9).text(
        `- ${p.nombreCompleto} (${p.tipo === 'PERSONAL' ? 'Personal' : 'Externo'}) - inscrito ${p.fechaInscripcion} - ${p.estado}${p.resultado ? ' - ' + p.resultado : ''}`,
      );
    }
    doc.fontSize(10);

    if (snapshot.firmante) {
      doc.moveDown(2);
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
