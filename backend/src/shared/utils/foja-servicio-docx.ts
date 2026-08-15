import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { FojaServicioSnapshot } from '../../modules/personal/types/foja-servicio-snapshot';

function valor(v: unknown): string {
  return v === null || v === undefined || v === '' ? '-' : String(v);
}

function campo(etiqueta: string, val: unknown): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${etiqueta}: `, bold: true }), new TextRun({ text: valor(val) })],
  });
}

function titulo(texto: string): Paragraph {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}

function subtitulo(texto: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: texto, bold: true })], spacing: { before: 150 } });
}

function item(texto: string): Paragraph {
  return new Paragraph({ text: `- ${texto}` });
}

/** Genera el .docx de la Foja de Servicio Bomberil (secciones I-VIII) a partir de un snapshot ya armado. */
export async function generarFojaServicioDocx(snapshot: FojaServicioSnapshot): Promise<Buffer> {
  const g = snapshot.datosGenerales;
  const p = snapshot.informacionPersonal;
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Foja de Servicio Bomberil', bold: true, size: 32 })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, text: `Ano ${snapshot.anio}` }),

    titulo('I. Datos Generales'),
    campo('Nombre completo', g.nombreCompleto),
    campo('Codigo', g.codigo),
    campo('Rango', g.rango),
    campo('Cargo', g.cargo),
    campo('Categoria / Condicion institucional', g.categoria),
    campo('Situacion', g.situacion),
    campo('Entidad de ingreso', g.entidadIngreso),
    campo('Fecha de nacimiento', g.fechaNacimiento),
    campo('Documento', g.documento),
    campo('Nacionalidad', g.nacionalidad),
    campo('Estado civil', g.estadoCivil),
    campo('Fecha de juramento', g.fechaJuramento),
    campo('Grupo sanguineo', g.grupoSanguineo),

    titulo('II. Informacion Personal'),
    campo('Direccion', p.direccion),
    campo('Localidad', p.localidad),
    campo('Pais', p.paisResidencia),
    campo('Email', p.email),
    campo('Codigo postal', p.codigoPostal),
    campo('Telefono', p.telefono),
    campo('Pasaporte', p.pasaporte),

    titulo('III. Antecedentes Bomberiles'),
    subtitulo('Cargos desempenados:'),
    ...(snapshot.antecedentes.cargosDesempenados.length === 0
      ? [item('Sin registros.')]
      : snapshot.antecedentes.cargosDesempenados.map((c) =>
          item(`${c.cargo} (${c.periodo})${c.institucion ? ' - ' + c.institucion : ''}${c.resolucion ? ' - Res. ' + c.resolucion : ''}`),
        )),
    subtitulo('Actividades destacadas:'),
    ...(snapshot.antecedentes.actividadesDestacadas.length === 0
      ? [item('Sin registros.')]
      : snapshot.antecedentes.actividadesDestacadas.map((a) => item(`${a.fecha}: ${a.descripcion}`))),

    titulo('IV. Especialidades Bomberiles'),
    ...(snapshot.especialidades.length === 0
      ? [item('Sin especialidades registradas.')]
      : snapshot.especialidades.map((e) =>
          item(`${e.especialidad}${e.nivel ? ' (' + e.nivel + ')' : ''}${e.vigencia ? ' - vigencia: ' + e.vigencia : ''}`),
        )),

    titulo('V. Actividades Profesionales'),
    ...(!snapshot.actividadProfesional
      ? [item('Sin datos registrados.')]
      : [
          campo('Profesion', snapshot.actividadProfesional.profesion),
          campo('Empresa', snapshot.actividadProfesional.empresa),
          campo('Experiencia', snapshot.actividadProfesional.experiencia),
        ]),

    titulo('VI. Formacion'),
    subtitulo('Certificaciones:'),
    ...(snapshot.formacion.length === 0
      ? [item('Sin formacion registrada.')]
      : snapshot.formacion.map((f) => item(`[${f.tipo}] ${f.nombre}${f.institucion ? ' - ' + f.institucion : ''} (${f.fecha})`))),
    subtitulo('Actividades academicas (modulo Academia):'),
    ...(snapshot.actividadesAcademicas.length === 0
      ? [item('Sin actividades academicas registradas.')]
      : snapshot.actividadesAcademicas.map((a) =>
          item(`${a.tipo ? '[' + a.tipo + '] ' : ''}${a.nombre} (${a.fechaInicio} - ${a.fechaFin}) - ${a.estado}${a.resultado ? ' - resultado: ' + a.resultado : ''}`),
        )),

    titulo('VII. Idiomas'),
    ...(snapshot.idiomas.length === 0
      ? [item('Sin idiomas registrados.')]
      : snapshot.idiomas.map((i) => item(`${i.idioma}${i.nivel ? ' (' + i.nivel + ')' : ''}`))),

    titulo('VIII. Otros'),
    subtitulo('Reconocimientos y distinciones:'),
    ...(snapshot.otros.reconocimientos.length === 0
      ? [item('Sin registros.')]
      : snapshot.otros.reconocimientos.map((r) => item(`${r.fecha}: ${r.descripcion}`))),
    ...(snapshot.otros.observaciones ? [campo('Observaciones', snapshot.otros.observaciones)] : []),

    new Paragraph({
      spacing: { before: 300 },
      children: [
        new TextRun({ text: `Generado: ${new Date(snapshot.generadoEn).toLocaleString('es-PY')}`, size: 16, color: '64748b' }),
      ],
    }),
  ];

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
