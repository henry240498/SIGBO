import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { OrdenGuardiaSnapshot } from '../../modules/guardias/types/orden-guardia-snapshot';

const MARGEN = 36;

function rutaAbsoluta(rutaServida: string | null): string | null {
  if (!rutaServida) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  return existsSync(absoluta) ? absoluta : null;
}

/** Genera el PDF de una Orden de Guardia a partir de un snapshot ya armado.
 * Mismo patron que generarFojaServicioPdf: recibe datos ya resueltos, no
 * consulta la base de datos. La grilla de grupos usa doc.rect() (nativo de
 * pdfkit); las tablas usan posicionamiento absoluto + paginacion, misma
 * tecnica que shared/utils/pdf.ts. */
export function generarOrdenGuardiaPdf(snapshot: OrdenGuardiaSnapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGEN, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const anchoUtil = doc.page.width - MARGEN * 2;

    function asegurarEspacio(alto: number) {
      if (doc.y + alto > doc.page.height - MARGEN) doc.addPage();
    }

    function tituloSeccion(texto: string) {
      asegurarEspacio(30);
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e3a8a').text(texto);
      doc.moveTo(MARGEN, doc.y + 2).lineTo(MARGEN + anchoUtil, doc.y + 2).strokeColor('#94a3b8').stroke();
      doc.moveDown(0.3);
      doc.fillColor('#000000').font('Helvetica').fontSize(9);
    }

    // --- Encabezado institucional ---
    const logoIzq = rutaAbsoluta(snapshot.institucional.logoIzquierdaUrl);
    const logoDer = rutaAbsoluta(snapshot.institucional.logoDerechaUrl);
    const yHeader = doc.y;
    if (logoIzq) {
      try {
        doc.image(logoIzq, MARGEN, yHeader, { width: 55, height: 55 });
      } catch {
        /* si la imagen no se puede leer, se omite */
      }
    }
    if (logoDer) {
      try {
        doc.image(logoDer, doc.page.width - MARGEN - 55, yHeader, { width: 55, height: 55 });
      } catch {
        /* si la imagen no se puede leer, se omite */
      }
    }
    doc.fontSize(9).font('Helvetica').text(snapshot.institucional.textoHeader || '', MARGEN + 65, yHeader, {
      width: anchoUtil - 130,
      align: 'center',
    });
    doc.y = Math.max(doc.y, yHeader + 60);
    doc.moveDown(0.5);

    doc.fontSize(9).font('Helvetica').text(`Emitida el ${snapshot.fechaEmision}`, { align: 'right' });
    doc.moveDown(0.3);

    // --- Titulo ---
    doc.fontSize(14).font('Helvetica-Bold').text(
      `ORDEN DE SERVICIO N° ${snapshot.numeroFormateado}`,
      { align: 'center' },
    );
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Periodo: ${snapshot.nombreMes} ${snapshot.anio}`, { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(0.5);

    // --- Introduccion ---
    doc.fontSize(9).font('Helvetica').text(snapshot.introduccion.textoRenderizado, { align: 'justify' });
    doc.moveDown(0.3);
    doc.text(snapshot.introduccion.reglaOficialTexto, { align: 'justify' });
    doc.text(snapshot.introduccion.reglaChoferTexto, { align: 'justify' });

    // --- Grupos rotativos (grilla de cajas) ---
    if (snapshot.gruposRotativos.length > 0) {
      tituloSeccion('Grupos de guardia');
      const columnas = 2;
      const anchoCaja = (anchoUtil - 10) / columnas;
      let columna = 0;
      let filaY = doc.y;
      let altoFilaMax = 0;

      for (const grupo of snapshot.gruposRotativos) {
        const x = MARGEN + columna * (anchoCaja + 10);
        const lineas = 3 + grupo.integrantes.length + 1;
        const altoCaja = 14 + lineas * 11;
        asegurarEspacio(altoCaja + 10);
        if (doc.y !== filaY) filaY = doc.y;

        doc.rect(x, filaY, anchoCaja, altoCaja).strokeColor('#94a3b8').stroke();
        let y = filaY + 6;
        doc.fontSize(9).font('Helvetica-Bold').text(
          `GRUPO: ${grupo.nombre}${grupo.diaSemana ? ` (${grupo.diaSemana})` : ''}`,
          x + 6, y, { width: anchoCaja - 12 },
        );
        y += 13;
        doc.fontSize(8).font('Helvetica');
        doc.text(`Oficial a cargo: ${grupo.oficialACargo?.nombreCompleto ?? '(sin asignar)'}`, x + 6, y, { width: anchoCaja - 12 });
        y += 11;
        doc.text(`Chofer: ${grupo.chofer?.nombreCompleto ?? '(sin asignar)'}`, x + 6, y, { width: anchoCaja - 12 });
        y += 11;
        for (const integrante of grupo.integrantes) {
          doc.text(`- ${integrante.nombreCompleto}`, x + 6, y, { width: anchoCaja - 12 });
          y += 11;
        }
        doc.font('Helvetica-Bold').text(`Fechas: ${grupo.fechasDelPeriodo.join(', ')}`, x + 6, y, { width: anchoCaja - 12 });

        altoFilaMax = Math.max(altoFilaMax, altoCaja);
        columna += 1;
        if (columna >= columnas) {
          columna = 0;
          doc.y = filaY + altoFilaMax + 10;
          filaY = doc.y;
          altoFilaMax = 0;
        }
      }
      if (columna !== 0) doc.y = filaY + altoFilaMax + 10;
    }

    // --- Rosters individuales ---
    for (const roster of snapshot.rostersIndividuales) {
      tituloSeccion(`${roster.esquemaNombre} (${roster.horaInicio.slice(0, 5)}-${roster.horaFin.slice(0, 5)})`);
      for (const f of roster.fechas) {
        asegurarEspacio(12);
        const nombres = f.asignaciones.map((a) => a.nombreCompleto).join(', ') || '(sin asignar)';
        doc.fontSize(8).font('Helvetica').text(`${f.fecha} (${f.diaSemana}): ${nombres}`, { width: anchoUtil });
      }
    }

    // --- Guardias especiales ---
    if (snapshot.guardiasEspeciales.length > 0) {
      tituloSeccion('Guardias especiales');
      for (const especial of snapshot.guardiasEspeciales) {
        asegurarEspacio(24);
        doc.fontSize(8).font('Helvetica-Bold').text(especial.modalidadTexto);
        doc.font('Helvetica');
        for (const oc of especial.ocurrencias) {
          const nombres = oc.asignaciones.map((a) => a.nombreCompleto).join(', ') || '(sin asignar)';
          doc.text(`  ${oc.fecha}: ${nombres}`);
        }
      }
    }

    // --- Conductores disponibles ---
    if (snapshot.conductoresDisponibles.length > 0) {
      tituloSeccion('Conductores disponibles al llamado');
      const texto = snapshot.conductoresDisponibles
        .map((c) => `${c.rango ? c.rango + ' ' : ''}${c.nombreCompleto}${c.telefono ? ` (${c.telefono})` : ''}`)
        .join(', ');
      doc.fontSize(8).font('Helvetica').text(texto, { width: anchoUtil, align: 'justify' });
    }

    // --- Pie de pagina ---
    if (snapshot.piePagina.texto) {
      doc.moveDown(0.5);
      asegurarEspacio(30);
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b').text(snapshot.piePagina.texto, { align: 'justify' });
      doc.fillColor('#000000');
    }

    // --- Firmantes ---
    if (snapshot.firmantes.length > 0) {
      doc.moveDown(2);
      asegurarEspacio(60);
      const anchoFirma = anchoUtil / snapshot.firmantes.length;
      const yFirma = doc.y;
      snapshot.firmantes.forEach((f, i) => {
        const x = MARGEN + i * anchoFirma;
        const selloAbs = rutaAbsoluta(f.selloUrl);
        if (selloAbs) {
          try {
            doc.image(selloAbs, x + anchoFirma / 2 - 30, yFirma, { width: 60, height: 40 });
          } catch {
            /* si la imagen no se puede leer, se omite */
          }
        }
        doc.moveTo(x + 10, yFirma + 45).lineTo(x + anchoFirma - 10, yFirma + 45).strokeColor('#000000').stroke();
        doc.fontSize(8).font('Helvetica-Bold').text(
          f.nombreCompleto ? `${f.rango ? f.rango + ' ' : ''}${f.nombreCompleto}` : '(cargo vacante)',
          x, yFirma + 48, { width: anchoFirma, align: 'center' },
        );
        doc.font('Helvetica').text(f.etiquetaCargo, x, doc.y, { width: anchoFirma, align: 'center' });
      });
    }

    doc.moveDown(1);
    doc.fontSize(7).fillColor('#94a3b8').text(`Generado por SIGBO: ${new Date(snapshot.generadoEn).toLocaleString('es-PY')}`);

    doc.end();
  });
}
