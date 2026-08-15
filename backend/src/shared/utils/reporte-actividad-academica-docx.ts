import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { ReporteActividadSnapshot } from '../../modules/academia/types/reporte-actividad-snapshot';

function valor(v: unknown): string {
  return v === null || v === undefined || v === '' ? '-' : String(v);
}

function campo(etiqueta: string, val: unknown): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: `${etiqueta}: `, bold: true }), new TextRun({ text: valor(val) })] });
}

function titulo(texto: string): Paragraph {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}

function item(texto: string): Paragraph {
  return new Paragraph({ text: `- ${texto}` });
}

/** DOCX del reporte de una actividad academica -- mismo snapshot que el PDF,
 * mismo criterio de reutilizacion del motor documental (seccion 28). */
export async function generarReporteActividadAcademicaDocx(snapshot: ReporteActividadSnapshot): Promise<Buffer> {
  const inst = snapshot.institucional;
  const a = snapshot.actividad;

  const children: Paragraph[] = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: inst.nombreInstitucion || 'CUERPO DE BOMBEROS VOLUNTARIOS', bold: true, size: 28 })] }),
    ...inst.lineasDestacadas.map((l) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: l.texto, bold: true, size: 16 })] })),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Reporte de Actividad Academica', bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),

    titulo('Datos de la actividad'),
    campo('Nombre', a.nombre),
    campo('Codigo', a.codigo),
    campo('Tipo', a.tipo),
    campo('Modalidad', a.modalidad),
    campo('Periodo', `${a.fechaInicio} - ${a.fechaFin}`),
    campo('Lugar', a.lugar),
    campo('Carga horaria', a.duracionHoras ? `${a.duracionHoras} hs` : null),
    campo('Estado', a.estado),
    campo('Capacitacion externa', a.esExterna ? 'Si' : 'No'),
    ...(a.descripcion ? [campo('Descripcion', a.descripcion)] : []),
    ...(a.objetivo ? [campo('Objetivo', a.objetivo)] : []),

    titulo('Instructores'),
    ...(snapshot.instructores.length === 0
      ? [item('Sin instructores asignados.')]
      : snapshot.instructores.map((i) => item(`${i.nombreCompleto} (${i.tipo === 'PERSONAL' ? 'Personal' : 'Externo'}, ${i.rolInstructor})${i.detalle ? ' - ' + i.detalle : ''}`))),

    titulo('Indicadores'),
    campo('Total de participantes', snapshot.indicadores.totalParticipantes),
    ...Object.entries(snapshot.indicadores.porEstado).map(([estado, cant]) => campo(`Estado: ${estado}`, cant)),
    ...Object.entries(snapshot.indicadores.porResultado).map(([resultado, cant]) => campo(`Resultado: ${resultado}`, cant)),

    titulo('Participantes'),
    ...(snapshot.participantes.length === 0
      ? [item('Sin participantes inscritos.')]
      : snapshot.participantes.map((p) =>
          item(`${p.nombreCompleto} (${p.tipo === 'PERSONAL' ? 'Personal' : 'Externo'}) - inscrito ${p.fechaInscripcion} - ${p.estado}${p.resultado ? ' - ' + p.resultado : ''}`),
        )),
  ];

  if (snapshot.firmante) {
    children.push(
      new Paragraph({ text: '', spacing: { before: 400 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, text: '_______________________________' }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: snapshot.firmante.nombreCompleto
              ? `${snapshot.firmante.rango ? snapshot.firmante.rango + ' ' : ''}${snapshot.firmante.nombreCompleto}`
              : '(cargo vacante)',
            bold: true,
          }),
        ],
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, text: snapshot.firmante.etiquetaCargo }),
    );
  }

  children.push(new Paragraph({ text: `Generado: ${new Date(snapshot.generadoEn).toLocaleString('es-PY')}`, spacing: { before: 300 } }));

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
