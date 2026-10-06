import PDFDocument from 'pdfkit';

export interface DatosInforme {
  servicio: {
    numeroServicio: string;
    estado: string;
    gravedad: string | null;
    direccion: string;
    ciudad: string | null;
    descripcion: string | null;
    fechaHoraAviso: Date | null;
    fechaHoraSalida: Date | null;
    fechaHoraLlegada: Date | null;
    fechaHoraFin: Date | null;
  };
  tipoServicio: string | null;
  llamado: { recibidoEn: Date; medio: string; llamanteNombre: string | null; llamanteTelefono: string | null; descripcion: string | null } | null;
  despachos: Array<{
    movil: string;
    estado: string;
    horaSalida: Date | null;
    horaLlegada: Date | null;
    horaFin: Date | null;
    horaRegreso: Date | null;
    kmRecorridos: number | null;
    motivoCancelacion: string | null;
  }>;
  cronologia: Array<{ cuando: Date; evento: string; movil: string | null; observacion: string | null }>;
  /** Personal que respondio a la convocatoria de este servicio. */
  convocados: Array<{ usuario: string; respuesta: string; etaMinutos: number | null }>;
  /** Personas afectadas (solo el recuento por categoria). null si no se registro nada. */
  victimas: { RESCATADA: number; HERIDA: number; FALLECIDA: number; EVACUADA: number } | null;
  generadoPor: string;
  generadoEn: Date;
}

const MARGEN = 38;
const TIEMPO = new Intl.DateTimeFormat('es-PY', { dateStyle: 'short', timeStyle: 'medium' });

const fecha = (d: Date | null | undefined) => (d ? TIEMPO.format(new Date(d)) : '—');

/** Duracion legible entre dos instantes; "—" si falta alguno. */
export function duracion(desde: Date | null | undefined, hasta: Date | null | undefined): string {
  if (!desde || !hasta) return '—';
  const seg = Math.max(0, Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 1000));
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return h > 0 ? `${h} h ${m} min` : m > 0 ? `${m} min ${s} s` : `${s} s`;
}

/**
 * Resumen operativo de una intervencion armado SOLO con lo que el sistema ya
 * registro (llamado, servicio, despachos y cronologia). No es el informe
 * firmado ni lo reemplaza: lleva la leyenda para que nadie lo confunda.
 */
export function generarPdfInforme(d: DatosInforme): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGEN, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const ancho = doc.page.width - MARGEN * 2;

    const encabezado = () => {
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#10263F').text('Resumen operativo de la intervencion', { align: 'center' });
      doc.font('Helvetica').fontSize(8).fillColor('#B42318').text('Generado automaticamente. No reemplaza la comunicacion ni el informe firmado.', { align: 'center' });
      doc.moveDown(0.4);
      doc.fillColor('#243447').fontSize(8).text(`Servicio N.º ${d.servicio.numeroServicio}   ·   Estado ${d.servicio.estado}`);
      doc.moveTo(MARGEN, doc.y + 4).lineTo(doc.page.width - MARGEN, doc.y + 4).strokeColor('#9FB3C8').stroke();
      doc.moveDown(0.8);
    };
    const espacio = (alto: number) => {
      if (doc.y + alto <= doc.page.height - MARGEN - 22) return;
      doc.addPage();
      encabezado();
    };
    const seccion = (nombre: string) => {
      espacio(34);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#10263F').text(nombre);
      doc.moveTo(MARGEN, doc.y + 2).lineTo(doc.page.width - MARGEN, doc.y + 2).strokeColor('#D6E1EA').stroke();
      doc.moveDown(0.45);
    };
    const campo = (nombre: string, valor: string | null | undefined) => {
      if (!valor) return;
      espacio(Math.max(14, doc.heightOfString(`${nombre}: ${valor}`, { width: ancho })) + 6);
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#243447').text(`${nombre}: `, { continued: true });
      doc.font('Helvetica').fillColor('#111827').text(valor);
    };

    encabezado();

    seccion('Datos del servicio');
    campo('Tipo', d.tipoServicio);
    campo('Gravedad', d.servicio.gravedad);
    campo('Direccion', [d.servicio.direccion, d.servicio.ciudad].filter(Boolean).join(', '));
    campo('Descripcion', d.servicio.descripcion);
    campo('Aviso', fecha(d.servicio.fechaHoraAviso));
    campo('Primera salida', fecha(d.servicio.fechaHoraSalida));
    campo('Primera llegada', fecha(d.servicio.fechaHoraLlegada));
    campo('Fin', fecha(d.servicio.fechaHoraFin));
    campo('Respuesta (aviso a llegada)', duracion(d.servicio.fechaHoraAviso, d.servicio.fechaHoraLlegada));
    campo('Duracion en el lugar', duracion(d.servicio.fechaHoraLlegada, d.servicio.fechaHoraFin));

    if (d.llamado) {
      seccion('Llamado de origen');
      campo('Recibido', fecha(d.llamado.recibidoEn));
      campo('Medio', d.llamado.medio);
      campo('Llamante', [d.llamado.llamanteNombre, d.llamado.llamanteTelefono].filter(Boolean).join(' · '));
      campo('Informado', d.llamado.descripcion);
    }

    seccion(`Moviles despachados (${d.despachos.length})`);
    if (d.despachos.length === 0) {
      doc.font('Helvetica').fontSize(8).fillColor('#64748B').text('No se registraron despachos de moviles.');
    }
    for (const x of d.despachos) {
      espacio(48);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#10263F').text(`Movil ${x.movil}  ·  ${x.estado}`);
      doc.font('Helvetica').fontSize(8).fillColor('#111827');
      doc.text(`Salida ${fecha(x.horaSalida)}   Llegada ${fecha(x.horaLlegada)}   Fin ${fecha(x.horaFin)}   Regreso ${fecha(x.horaRegreso)}`);
      doc.text(`Respuesta ${duracion(x.horaSalida, x.horaLlegada)}   En el lugar ${duracion(x.horaLlegada, x.horaFin)}   Regreso ${duracion(x.horaFin, x.horaRegreso)}${x.kmRecorridos !== null ? `   Recorrido ${x.kmRecorridos} km` : ''}`);
      if (x.motivoCancelacion) doc.fillColor('#B42318').text(`Cancelado: ${x.motivoCancelacion}`);
      doc.moveDown(0.4);
    }

    if (d.convocados.length > 0) {
      seccion(`Personal convocado (${d.convocados.length})`);
      for (const c of d.convocados) {
        espacio(14);
        doc.font('Helvetica').fontSize(8).fillColor('#111827').text(`${c.usuario}: ${c.respuesta === 'VOY' ? `voy${c.etaMinutos !== null ? ` (${c.etaMinutos} min)` : ''}` : 'no puede'}`);
      }
    }

    if (d.victimas) {
      seccion('Personas afectadas');
      doc.font('Helvetica').fontSize(8).fillColor('#111827').text(`Rescatadas: ${d.victimas.RESCATADA}   Heridas: ${d.victimas.HERIDA}   Fallecidas: ${d.victimas.FALLECIDA}   Evacuadas: ${d.victimas.EVACUADA}`);
    }

    seccion('Cronologia');
    if (d.cronologia.length === 0) {
      doc.font('Helvetica').fontSize(8).fillColor('#64748B').text('Sin eventos registrados.');
    }
    for (const e of d.cronologia) {
      espacio(14);
      doc.font('Helvetica').fontSize(8).fillColor('#111827').text(
        `${fecha(e.cuando)}   ${e.evento}${e.movil ? `  (movil ${e.movil})` : ''}${e.observacion ? ` — ${e.observacion}` : ''}`,
      );
    }

    doc.moveDown(1);
    doc.font('Helvetica').fontSize(7).fillColor('#64748B').text(`Generado el ${fecha(d.generadoEn)} por ${d.generadoPor}.`);

    const paginas = doc.bufferedPageRange();
    for (let i = 0; i < paginas.count; i += 1) {
      doc.switchToPage(paginas.start + i);
      doc.font('Helvetica').fontSize(7).fillColor('#64748B').text(
        `Servicio ${d.servicio.numeroServicio} · Pagina ${i + 1} de ${paginas.count}`,
        MARGEN,
        doc.page.height - 22,
        { width: ancho, align: 'center' },
      );
    }
    doc.end();
  });
}
