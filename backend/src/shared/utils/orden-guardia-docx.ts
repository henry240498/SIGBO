import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { existsSync, readFileSync } from 'fs';
import { extname, join } from 'path';
import { OrdenGuardiaSnapshot } from '../../modules/guardias/types/orden-guardia-snapshot';

const SIN_BORDE = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const TIPOS_IMAGEN_DOCX: Record<string, 'png' | 'jpg' | 'gif' | 'bmp'> = {
  '.png': 'png',
  '.jpg': 'jpg',
  '.jpeg': 'jpg',
  '.gif': 'gif',
  '.bmp': 'bmp',
};

function titulo(texto: string): Paragraph {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } });
}

function parrafo(texto: string): Paragraph {
  return new Paragraph({ text: texto, spacing: { after: 100 } });
}

/** docx.ImageRun exige declarar el `type` del formato -- lo derivamos de la
 * extension del archivo guardado en vez de asumir siempre png. Si el
 * formato no es soportado (ej. webp) se omite la imagen en vez de generar
 * un .docx corrupto. */
function datosImagen(rutaServida: string | null): { data: Buffer; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null {
  if (!rutaServida) return null;
  const tipo = TIPOS_IMAGEN_DOCX[extname(rutaServida).toLowerCase()];
  if (!tipo) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  if (!existsSync(absoluta)) return null;
  try {
    return { data: readFileSync(absoluta), type: tipo };
  } catch {
    return null;
  }
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
  const inst = snapshot.institucional;
  const logoIzq = datosImagen(inst.logoIzquierdaUrl);
  const logoDer = datosImagen(inst.logoDerechaUrl);
  const datosContacto = [
    inst.direccion,
    inst.telefono,
    inst.email ? `Email: ${inst.email}` : null,
    inst.sitioWeb,
    inst.personeriaJuridica ? `Personería Jurídica ${inst.personeriaJuridica}` : null,
    inst.fechaFundacion ? `Fundado el ${inst.fechaFundacion}` : null,
  ].filter((x): x is string => !!x);

  const celdaLogo = (logo: { data: Buffer; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null) =>
    new TableCell({
      width: { size: 15, type: WidthType.PERCENTAGE },
      borders: SIN_BORDE,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: logo ? [new ImageRun({ data: logo.data, transformation: { width: 55, height: 55 }, type: logo.type })] : [],
        }),
      ],
    });

  const textoHeaderCelda = new TableCell({
    width: { size: 70, type: WidthType.PERCENTAGE },
    borders: SIN_BORDE,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: inst.nombreInstitucion || '', bold: true, size: 26 })],
      }),
      ...inst.lineasDestacadas.map(
        (l) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: l.texto, bold: true, size: 16 })] }),
      ),
      ...datosContacto.map((l) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: l, size: 16 })] })),
    ],
  });

  const children: (Paragraph | Table)[] = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [celdaLogo(logoIzq), textoHeaderCelda, celdaLogo(logoDer)] })],
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
            children: snapshot.firmantes.map((f) => {
              const firma = datosImagen(f.firmaDigitalUrl);
              const parrafos = [
                firma
                  ? new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new ImageRun({ data: firma.data, transformation: { width: 60, height: 40 }, type: firma.type })],
                    })
                  : new Paragraph({ text: '..........................................', alignment: AlignmentType.CENTER }),
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
              ];
              if (f.advertencia) {
                parrafos.push(
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: `⚠ ${f.advertencia}`, size: 14, color: 'b45309' })],
                  }),
                );
              }
              return new TableCell({ width: { size: 100 / snapshot.firmantes.length, type: WidthType.PERCENTAGE }, children: parrafos });
            }),
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

  const piePag = inst.piePaginaInstitucional;
  const piePagRuns: TextRun[] = [];
  if (piePag.texto) piePagRuns.push(new TextRun({ text: piePag.texto, size: 14, color: '94a3b8' }));
  if (piePag.mostrarNumeroPagina) {
    if (piePagRuns.length) piePagRuns.push(new TextRun({ text: ' — ', size: 14, color: '94a3b8' }));
    piePagRuns.push(
      new TextRun({ text: 'Página ', size: 14, color: '94a3b8' }),
      new TextRun({ children: [PageNumber.CURRENT], size: 14, color: '94a3b8' }),
      new TextRun({ text: ' de ', size: 14, color: '94a3b8' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 14, color: '94a3b8' }),
    );
  }

  const doc = new Document({
    sections: [
      {
        children,
        footers: piePagRuns.length
          ? { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: piePagRuns })] }) }
          : undefined,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
