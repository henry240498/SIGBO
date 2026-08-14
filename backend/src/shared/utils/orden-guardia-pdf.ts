import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { OrdenGuardiaSnapshot } from '../../modules/guardias/types/orden-guardia-snapshot';

const MARGEN = 38;
const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

function rutaAbsoluta(rutaServida: string | null): string | null {
  if (!rutaServida) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  return existsSync(absoluta) ? absoluta : null;
}

function fechaLarga(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
  return `${dia} de ${MESES[mes] ?? ''} de ${anio}`;
}

function diaMes(fecha: string): string {
  return fecha.slice(8, 10);
}

/** PDF oficial de Orden de Guardia. Su composicion reproduce el formato
 * institucional de referencia: membrete compacto, orden centrada, cuadros
 * de grupos/turnos y firmas al pie. Los datos siguen proviniendo solo del
 * snapshot inmutable de la Orden. */
export function generarOrdenGuardiaPdf(snapshot: OrdenGuardiaSnapshot): Promise<Buffer> {
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

    function nuevaPaginaSiHaceFalta(alto: number) {
      if (doc.y + alto > doc.page.height - MARGEN - 92) doc.addPage();
    }

    function linea(x: number, y: number, largo: number) {
      doc.moveTo(x, y).lineTo(x + largo, y).strokeColor('#000000').lineWidth(0.45).stroke();
    }

    function textoCelda(texto: string, x: number, y: number, anchoCelda: number, tam = 6.7, negrita = false) {
      doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(tam).fillColor('#000000')
        .text(texto, x + 3, y + 2, { width: anchoCelda - 6, lineGap: 0.4 });
    }

    function encabezadoInstitucional() {
      const inicio = doc.y;
      const anchoCentro = ancho - 116;
      const xCentro = MARGEN + 58;
      let y = inicio;
      doc.font('Helvetica-Bold').fontSize(8.8).text(inst.nombreInstitucion || 'CUERPO DE BOMBEROS VOLUNTARIOS', xCentro, y, { width: anchoCentro, align: 'center' });
      y += 11;
      for (const item of inst.lineasDestacadas) {
        doc.font('Helvetica-Bold').fontSize(5.7).text(item.texto, xCentro, y, { width: anchoCentro, align: 'center', lineGap: 0 });
        y += 7;
      }
      const contacto = [
        inst.direccion,
        inst.telefono ? `Tel.: ${inst.telefono}` : null,
        inst.email,
        inst.sitioWeb,
        inst.personeriaJuridica ? `Personeria juridica ${inst.personeriaJuridica}` : null,
      ].filter((v): v is string => !!v);
      for (const item of contacto) {
        doc.font('Helvetica').fontSize(5.4).text(item, xCentro, y, { width: anchoCentro, align: 'center', lineGap: 0 });
        y += 6.5;
      }
      if (logoIzq) {
        try { doc.image(logoIzq, MARGEN, inicio, { fit: [48, 60], align: 'center', valign: 'center' }); } catch { /* imagen invalida: se omite */ }
      }
      if (logoDer) {
        try { doc.image(logoDer, doc.page.width - MARGEN - 48, inicio, { fit: [48, 60], align: 'center', valign: 'center' }); } catch { /* imagen invalida: se omite */ }
      }
      doc.y = Math.max(y, inicio + 61) + 3;
    }

    function encabezadoDocumento() {
      encabezadoInstitucional();
      doc.font('Helvetica-Bold').fontSize(7.5).text(`Carapegua, ${fechaLarga(snapshot.fechaEmision)}`, { align: 'right' });
      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').fontSize(9.3).text(`ORDEN DE SERVICIO N. ${snapshot.numeroFormateado}`, { align: 'center' });
      doc.moveDown(0.45);
      doc.font('Helvetica').fontSize(7.5).text(snapshot.introduccion.textoRenderizado, { align: 'justify', lineGap: 1.2 });
      doc.moveDown(0.7);
    }

    function grillaGrupos() {
      if (!snapshot.gruposRotativos.length) return;
      const columnas = 3;
      const anchoCelda = ancho / columnas;
      for (let inicio = 0; inicio < snapshot.gruposRotativos.length; inicio += columnas) {
        const grupos = snapshot.gruposRotativos.slice(inicio, inicio + columnas);
        const lineasMax = Math.max(...grupos.map((g) => 3 + g.integrantes.length));
        const alto = 15 + lineasMax * 8.3 + 10;
        nuevaPaginaSiHaceFalta(alto + 4);
        const y = doc.y;
        for (let i = 0; i < columnas; i += 1) {
          const grupo = grupos[i];
          const x = MARGEN + i * anchoCelda;
          doc.rect(x, y, anchoCelda, alto).lineWidth(0.45).strokeColor('#000000').stroke();
          if (!grupo) continue;
          textoCelda(`GRUPO N. ${grupo.nombre}${grupo.diaSemana ? ` (${grupo.diaSemana})` : ''}`, x, y, anchoCelda, 6.4, true);
          linea(x, y + 13, anchoCelda);
          let yTexto = y + 15;
          if (grupo.oficialACargo) { textoCelda(`${grupo.oficialACargo.rango ? `${grupo.oficialACargo.rango} ` : ''}${grupo.oficialACargo.nombreCompleto}`, x, yTexto, anchoCelda, 6.4, true); yTexto += 8.3; }
          if (grupo.chofer) { textoCelda(`${grupo.chofer.rango ? `${grupo.chofer.rango} ` : ''}${grupo.chofer.nombreCompleto}`, x, yTexto, anchoCelda, 6.4); yTexto += 8.3; }
          for (const integrante of grupo.integrantes.filter((p) => p.bomberoId !== grupo.oficialACargo?.bomberoId && p.bomberoId !== grupo.chofer?.bomberoId)) {
            textoCelda(`${integrante.rango ? `${integrante.rango} ` : ''}${integrante.nombreCompleto}`, x, yTexto, anchoCelda, 6.4);
            yTexto += 8.3;
          }
          textoCelda(`${snapshot.nombreMes.toUpperCase()}: ${grupo.fechasDelPeriodo.map(diaMes).join(', ') || '-'}`, x, y + alto - 11, anchoCelda, 6.3, true);
        }
        doc.y = y + alto + 3;
      }
    }

    function cuadroRoster(roster: OrdenGuardiaSnapshot['rostersIndividuales'][number], x: number, y: number, anchoCelda: number, alto: number) {
      doc.rect(x, y, anchoCelda, alto).lineWidth(0.45).strokeColor('#000000').stroke();
      textoCelda(`${roster.esquemaNombre.toUpperCase()} (${roster.horaInicio.slice(0, 5)} a ${roster.horaFin.slice(0, 5)} hs)`, x, y, anchoCelda, 6.5, true);
      linea(x, y + 13, anchoCelda);
      let cursor = y + 14;
      for (const fecha of roster.fechas) {
        const nombres = fecha.asignaciones.map((p) => `${p.rango ? `${p.rango} ` : ''}${p.nombreCompleto}`).join(', ') || 'Sin asignar';
        doc.font('Helvetica').fontSize(6.2);
        const altoFila = Math.max(12, doc.heightOfString(nombres, { width: anchoCelda - 27, lineGap: 0.2 }) + 4);
        if (cursor + altoFila > y + alto) break;
        linea(x, cursor + altoFila, anchoCelda);
        textoCelda(diaMes(fecha.fecha), x, cursor, 22, 6.4);
        doc.font('Helvetica').fontSize(6.2).text(nombres, x + 24, cursor + 2, { width: anchoCelda - 27, lineGap: 0.2 });
        cursor += altoFila;
      }
    }

    function cuadrosRosters() {
      const rosters = snapshot.rostersIndividuales;
      for (let i = 0; i < rosters.length; i += 2) {
        const izquierda = rosters[i];
        const derecha = rosters[i + 1];
        doc.font('Helvetica').fontSize(6.2);
        const alturaIzq = 16 + izquierda.fechas.reduce((s, f) => s + Math.max(12, doc.heightOfString(f.asignaciones.map((p) => p.nombreCompleto).join(', ') || 'Sin asignar', { width: ancho / 2 - 27 }) + 4), 0);
        const alturaDer = derecha ? 16 + derecha.fechas.reduce((s, f) => s + Math.max(12, doc.heightOfString(f.asignaciones.map((p) => p.nombreCompleto).join(', ') || 'Sin asignar', { width: ancho / 2 - 27 }) + 4), 0) : 0;
        const alto = Math.max(30, alturaIzq, alturaDer);
        nuevaPaginaSiHaceFalta(alto + 4);
        const y = doc.y;
        cuadroRoster(izquierda, MARGEN, y, ancho / 2, alto);
        if (derecha) cuadroRoster(derecha, MARGEN + ancho / 2, y, ancho / 2, alto);
        doc.y = y + alto + 3;
      }
    }

    function guardiasEspeciales() {
      if (!snapshot.guardiasEspeciales.length) return;
      nuevaPaginaSiHaceFalta(42);
      for (const especial of snapshot.guardiasEspeciales) {
        doc.font('Helvetica-Bold').fontSize(6.7).text(especial.modalidadTexto.toUpperCase(), { align: 'center' });
        for (const ocurrencia of especial.ocurrencias) {
          const texto = `${diaMes(ocurrencia.fecha)}  ${ocurrencia.asignaciones.map((p) => p.nombreCompleto).join(', ') || 'Sin asignar'}`;
          doc.font('Helvetica').fontSize(6.5).text(texto);
        }
      }
      doc.moveDown(0.4);
    }

    function bloqueFinal() {
      const reglas = [snapshot.introduccion.reglaOficialTexto, snapshot.introduccion.reglaChoferTexto].filter(Boolean).join(' ');
      const conductores = snapshot.conductoresDisponibles.map((p) => `${p.rango ? `${p.rango} ` : ''}${p.nombreCompleto}${p.telefono ? ` (${p.telefono})` : ''}`).join(', ');
      const altoNecesario = 120;
      nuevaPaginaSiHaceFalta(altoNecesario);
      if (reglas) doc.font('Helvetica').fontSize(6.5).text(reglas, { align: 'justify', lineGap: 0.6 });
      if (conductores) {
        doc.moveDown(0.35);
        doc.font('Helvetica-Bold').fontSize(6.7).text('Los Conductores Disponibles al llamado.');
        doc.font('Helvetica').fontSize(6.4).text(conductores, { lineGap: 0.4 });
      }
      if (snapshot.piePagina.texto) {
        doc.moveDown(0.35);
        doc.font('Helvetica-Oblique').fontSize(6.2).text(snapshot.piePagina.texto, { align: 'justify' });
      }
      if (!snapshot.firmantes.length) return;
      doc.moveDown(1.7);
      nuevaPaginaSiHaceFalta(74);
      const anchoFirma = ancho / snapshot.firmantes.length;
      const y = doc.y;
      snapshot.firmantes.forEach((firmante, indice) => {
        const x = MARGEN + indice * anchoFirma;
        const firma = rutaAbsoluta(firmante.firmaDigitalUrl);
        if (firma) {
          try { doc.image(firma, x + anchoFirma / 2 - 25, y, { fit: [50, 36], align: 'center', valign: 'center' }); } catch { /* imagen invalida: se omite */ }
        }
        linea(x + 10, y + 39, anchoFirma - 20);
        const nombre = firmante.nombreCompleto ? `${firmante.rango ? `${firmante.rango} ` : ''}${firmante.nombreCompleto}` : '(cargo vacante)';
        doc.font('Helvetica-Bold').fontSize(6.5).text(nombre, x, y + 42, { width: anchoFirma, align: 'center' });
        doc.font('Helvetica-Bold').fontSize(6.2).text(firmante.etiquetaCargo, x, y + 51, { width: anchoFirma, align: 'center' });
      });
      doc.y = y + 62;
    }

    encabezadoDocumento();
    grillaGrupos();
    cuadrosRosters();
    guardiasEspeciales();
    bloqueFinal();

    const pie = inst.piePaginaInstitucional;
    if (pie.texto || pie.mostrarNumeroPagina || pie.mostrarGeneradoSigbo) {
      const paginas = doc.bufferedPageRange();
      for (let indice = paginas.start; indice < paginas.start + paginas.count; indice += 1) {
        doc.switchToPage(indice);
        const partes = [pie.texto, pie.mostrarNumeroPagina ? `Pagina ${indice + 1} de ${paginas.count}` : null, pie.mostrarGeneradoSigbo ? 'Generado por SIGBO' : null].filter(Boolean);
        doc.font('Helvetica').fontSize(5.7).fillColor('#666666').text(partes.join(' - '), MARGEN, doc.page.height - MARGEN + 14, { width: ancho, align: 'center' });
      }
    }
    doc.end();
  });
}
