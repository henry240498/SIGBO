import PDFDocument from 'pdfkit';
import { ComunicacionServicio, Servicio } from '../../shared/entities';

type Formulario = Record<string, unknown>;

const MARGEN = 38;

/** Representación impresa legible del registro. No se presenta como informe ni firma electrónica. */
export function generarPdfComunicacion(
  comunicacion: ComunicacionServicio,
  servicio: Servicio,
  formulario: Formulario,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGEN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const titulo = comunicacion.tipo === 'INCENDIO'
      ? 'Comunicación de Incendios de Uso Interno'
      : 'Comunicación de Otras Ocurrencias de Uso Interno';

    const encabezado = () => {
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#10263F').text(titulo, { align: 'center' });
      doc.font('Helvetica').fontSize(8).fillColor('#B42318').text('No valido como Informe', { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor('#243447').fontSize(8).text(`N.º ${servicio.numeroServicio}   ·   Fecha ${fecha(formulario.fechaServicio ?? formulario.fecha ?? servicio.fechaHoraAviso)}   ·   Estado ${comunicacion.estado}`);
      doc.moveTo(MARGEN, doc.y + 4).lineTo(doc.page.width - MARGEN, doc.y + 4).strokeColor('#9FB3C8').stroke();
      doc.moveDown(0.8);
    };

    const espacio = (alto: number) => {
      if (doc.y + alto <= doc.page.height - MARGEN - 22) return;
      doc.addPage();
      encabezado();
    };

    const seccion = (nombre: string) => {
      espacio(32);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#10263F').text(nombre);
      doc.moveTo(MARGEN, doc.y + 2).lineTo(doc.page.width - MARGEN, doc.y + 2).strokeColor('#D6E1EA').stroke();
      doc.moveDown(0.45);
    };

    const campo = (nombre: string, valor: unknown) => {
      if (vacio(valor)) return;
      const texto = textoValor(valor);
      const alto = Math.max(14, doc.heightOfString(`${nombre}: ${texto}`, { width: doc.page.width - MARGEN * 2 }));
      espacio(alto + 6);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#243447').text(`${nombre}: `, { continued: true });
      doc.font('Helvetica').fillColor('#111827').text(texto);
    };

    encabezado();
    seccion('Datos generales');
    campo('Fecha', formulario.fechaServicio ?? formulario.fecha);
    campo('Denuncia', formulario.horaDenuncia ?? formulario.denuncia);
    campo('Salida general', formulario.horaSalidaGeneral ?? formulario.salida);
    campo('En base general', formulario.horaEnBaseGeneral ?? formulario.enBase);
    campo('Denunciante', formulario.denuncianteNombre ?? formulario.denunciante);
    campo('Teléfono', formulario.denuncianteTelefono ?? formulario.telefono);
    campo('Recibido por', formulario.recibidoPorPersonaId ?? formulario.recibidoPor);
    campo('Localidad', formulario.localidad);
    campo('Barrio / Cía.', formulario.barrioCompania ?? formulario.barrio);
    campo('Dirección', formulario.direccion ?? servicio.direccion);
    campo('Comandante de incidente', formulario.comandanteIncidentePersonaId ?? formulario.comandanteIncidente ?? formulario.comandante);

    const omitidos = new Set([
      'fechaServicio', 'fecha', 'horaDenuncia', 'denuncia', 'horaSalidaGeneral', 'salida', 'horaEnBaseGeneral', 'enBase',
      'denuncianteNombre', 'denunciante', 'denuncianteTelefono', 'telefono', 'recibidoPorPersonaId', 'recibidoPor',
      'localidad', 'barrioCompania', 'barrio', 'direccion', 'comandanteIncidentePersonaId', 'comandanteIncidente', 'comandante', 'croquis',
    ]);
    seccion(comunicacion.tipo === 'INCENDIO' ? 'Datos del incendio y recursos' : 'Datos de la ocurrencia');
    for (const [clave, valor] of Object.entries(formulario)) if (!omitidos.has(clave) && !vacio(valor)) campo(etiqueta(clave), valor);

    const croquis = typeof formulario.croquis === 'string' ? formulario.croquis : '';
    if (croquis.startsWith('data:image/png;base64,') || croquis.startsWith('data:image/jpeg;base64,')) {
      try {
        seccion('Croquis o mapa situacional');
        const imagen = Buffer.from(croquis.slice(croquis.indexOf(',') + 1), 'base64');
        espacio(220);
        doc.image(imagen, { fit: [doc.page.width - MARGEN * 2, 210], align: 'center' });
        doc.moveDown(0.6);
      } catch {
        campo('Croquis', 'Adjunto no disponible para la impresión');
      }
    }

    const paginas = doc.bufferedPageRange();
    for (let indice = 0; indice < paginas.count; indice += 1) {
      doc.switchToPage(paginas.start + indice);
      doc.font('Helvetica').fontSize(7).fillColor('#64748B').text(
        `Comunicación ${servicio.numeroServicio} · Página ${indice + 1} de ${paginas.count}`,
        MARGEN,
        doc.page.height - 22,
        { width: doc.page.width - MARGEN * 2, align: 'center' },
      );
    }
    doc.end();
  });
}

function etiqueta(clave: string): string {
  return clave
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (letra) => letra.toUpperCase());
}

function fecha(valor: unknown): string {
  if (valor instanceof Date) return valor.toLocaleDateString('es-PY');
  return textoValor(valor);
}

function vacio(valor: unknown): boolean {
  if (valor === undefined || valor === null || valor === '') return true;
  if (Array.isArray(valor)) return valor.length === 0;
  if (typeof valor === 'object') return Object.keys(valor as Record<string, unknown>).length === 0;
  return false;
}

function textoValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (typeof valor === 'string' || typeof valor === 'number') return String(valor);
  if (Array.isArray(valor)) return valor.map(textoValor).filter(Boolean).join(' · ');
  if (typeof valor === 'object') return Object.entries(valor as Record<string, unknown>)
    .map(([clave, contenido]) => `${etiqueta(clave)}: ${textoValor(contenido)}`)
    .join(' | ');
  return String(valor);
}
