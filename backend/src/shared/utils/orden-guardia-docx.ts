import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { OrdenGuardiaSnapshot } from '../../modules/guardias/types/orden-guardia-snapshot';

function titulo(texto: string): Paragraph {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
}

function parrafo(texto: string): Paragraph {
  return new Paragraph({ text: texto, spacing: { after: 100 } });
}

function celda(texto: string, opciones?: { bold?: boolean }): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: texto, bold: opciones?.bold ?? false, size: 18 })] })],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/** Genera el .docx de una Orden de Guardia a partir de un snapshot ya
 * armado. Mismo espiritu que generarFojaServicioDocx: solo renderiza datos
 * ya resueltos. Usa Table/TableRow/TableCell (soportado por el paquete
 * `docx` ya instalado) para la grilla de grupos y las tablas del resto de
 * secciones. */
export async function generarOrdenGuardiaDocx(snapshot: OrdenGuardiaSnapshot): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: snapshot.institucional.textoHeader || 'CUERPO DE BOMBEROS VOLUNTARIOS', bold: true, size: 20 })],
    }),
    new Paragraph({ alignment: AlignmentType.RIGHT, text: `Emitida el ${snapshot.fechaEmision}` }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: `ORDEN DE SERVICIO N° ${snapshot.numeroFormateado}`, bold: true, size: 28 })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, text: `Periodo: ${snapshot.nombreMes} ${snapshot.anio}` }),
    new Paragraph({ text: '' }),
    parrafo(snapshot.introduccion.textoRenderizado),
    parrafo(snapshot.introduccion.reglaOficialTexto),
    parrafo(snapshot.introduccion.reglaChoferTexto),
  ];

  if (snapshot.gruposRotativos.length > 0) {
    children.push(titulo('Grupos de guardia'));
    for (const grupo of snapshot.gruposRotativos) {
      const filas = [
        new TableRow({
          children: [celda(`GRUPO: ${grupo.nombre}${grupo.diaSemana ? ` (${grupo.diaSemana})` : ''}`, { bold: true })],
        }),
        new TableRow({ children: [celda(`Oficial a cargo: ${grupo.oficialACargo?.nombreCompleto ?? '(sin asignar)'}`)] }),
        new TableRow({ children: [celda(`Chofer: ${grupo.chofer?.nombreCompleto ?? '(sin asignar)'}`)] }),
        ...grupo.integrantes.map((i) => new TableRow({ children: [celda(`- ${i.nombreCompleto}`)] })),
        new TableRow({ children: [celda(`Fechas: ${grupo.fechasDelPeriodo.join(', ')}`, { bold: true })] }),
      ];
      children.push(new Table({ rows: filas, width: { size: 100, type: WidthType.PERCENTAGE } }));
      children.push(new Paragraph({ text: '' }));
    }
  }

  for (const roster of snapshot.rostersIndividuales) {
    children.push(titulo(`${roster.esquemaNombre} (${roster.horaInicio.slice(0, 5)}-${roster.horaFin.slice(0, 5)})`));
    for (const f of roster.fechas) {
      const nombres = f.asignaciones.map((a) => a.nombreCompleto).join(', ') || '(sin asignar)';
      children.push(parrafo(`${f.fecha} (${f.diaSemana}): ${nombres}`));
    }
  }

  if (snapshot.guardiasEspeciales.length > 0) {
    children.push(titulo('Guardias especiales'));
    for (const especial of snapshot.guardiasEspeciales) {
      children.push(new Paragraph({ children: [new TextRun({ text: especial.modalidadTexto, bold: true })] }));
      for (const oc of especial.ocurrencias) {
        const nombres = oc.asignaciones.map((a) => a.nombreCompleto).join(', ') || '(sin asignar)';
        children.push(parrafo(`  ${oc.fecha}: ${nombres}`));
      }
    }
  }

  if (snapshot.conductoresDisponibles.length > 0) {
    children.push(titulo('Conductores disponibles al llamado'));
    const texto = snapshot.conductoresDisponibles
      .map((c) => `${c.rango ? c.rango + ' ' : ''}${c.nombreCompleto}${c.telefono ? ` (${c.telefono})` : ''}`)
      .join(', ');
    children.push(parrafo(texto));
  }

  if (snapshot.piePagina.texto) {
    children.push(new Paragraph({ text: '' }));
    children.push(new Paragraph({ children: [new TextRun({ text: snapshot.piePagina.texto, italics: true, color: '64748b' })] }));
  }

  if (snapshot.firmantes.length > 0) {
    children.push(new Paragraph({ text: '' }));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: snapshot.firmantes.map((f) =>
              new TableCell({
                width: { size: 100 / snapshot.firmantes.length, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ text: '..........................................', alignment: AlignmentType.CENTER }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: f.nombreCompleto ? `${f.rango ? f.rango + ' ' : ''}${f.nombreCompleto}` : '(cargo vacante)',
                        bold: true,
                        size: 18,
                      }),
                    ],
                  }),
                  new Paragraph({ text: f.etiquetaCargo, alignment: AlignmentType.CENTER }),
                ],
              }),
            ),
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 300 },
      children: [new TextRun({ text: `Generado por SIGBO: ${new Date(snapshot.generadoEn).toLocaleString('es-PY')}`, size: 14, color: '64748b' })],
    }),
  );

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
