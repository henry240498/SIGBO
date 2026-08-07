import PDFDocument from 'pdfkit';
import { existsSync } from 'fs';
import { join } from 'path';
import { FojaServicioSnapshot } from '../../modules/personal/types/foja-servicio-snapshot';

const MARGEN = 40;

function rutaAbsoluta(rutaServida: string | null): string | null {
  if (!rutaServida) return null;
  const absoluta = join(process.cwd(), rutaServida.replace(/^\//, ''));
  return existsSync(absoluta) ? absoluta : null;
}

function valor(v: unknown): string {
  return v === null || v === undefined || v === '' ? '-' : String(v);
}

/** Genera el PDF de la Foja de Servicio Bomberil (secciones I-VIII) a partir de un snapshot ya armado. */
export function generarFojaServicioPdf(snapshot: FojaServicioSnapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGEN, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const anchoUtil = doc.page.width - MARGEN * 2;

    doc.fontSize(16).font('Helvetica-Bold').text('Foja de Servicio Bomberil', { align: 'center' });
    doc.fontSize(11).font('Helvetica').fillColor('#64748b').text(`Ano ${snapshot.anio}`, { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(0.5);

    const fotoAbs = rutaAbsoluta(snapshot.datosGenerales.fotoUrl);
    const yInicioSeccion1 = doc.y;
    if (fotoAbs) {
      try {
        doc.image(fotoAbs, doc.page.width - MARGEN - 90, yInicioSeccion1, { width: 90, height: 110 });
      } catch {
        /* si la imagen no se puede leer, se omite sin romper el documento */
      }
    }

    function seccion(titulo: string) {
      doc.moveDown(0.6);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e3a8a').text(titulo);
      doc.moveTo(MARGEN, doc.y + 2).lineTo(MARGEN + anchoUtil, doc.y + 2).strokeColor('#94a3b8').stroke();
      doc.moveDown(0.4);
      doc.fillColor('#000000').font('Helvetica').fontSize(10);
    }

    function campo(etiqueta: string, val: unknown, anchoCol = anchoUtil) {
      doc.font('Helvetica-Bold').text(`${etiqueta}: `, { continued: true, width: anchoCol });
      doc.font('Helvetica').text(valor(val));
    }

    seccion('I. Datos Generales');
    const g = snapshot.datosGenerales;
    campo('Nombre completo', g.nombreCompleto, anchoUtil - 100);
    campo('Codigo', g.codigo, anchoUtil - 100);
    campo('Rango', g.rango, anchoUtil - 100);
    campo('Cargo', g.cargo, anchoUtil - 100);
    campo('Categoria / Condicion institucional', g.categoria, anchoUtil - 100);
    campo('Situacion', g.situacion, anchoUtil - 100);
    campo('Entidad de ingreso', g.entidadIngreso, anchoUtil - 100);
    campo('Fecha de nacimiento', g.fechaNacimiento, anchoUtil - 100);
    campo('Documento', g.documento, anchoUtil - 100);
    campo('Nacionalidad', g.nacionalidad, anchoUtil - 100);
    campo('Estado civil', g.estadoCivil, anchoUtil - 100);
    campo('Fecha de juramento', g.fechaJuramento, anchoUtil - 100);
    campo('Grupo sanguineo', g.grupoSanguineo, anchoUtil - 100);

    seccion('II. Informacion Personal');
    const p = snapshot.informacionPersonal;
    campo('Direccion', p.direccion);
    campo('Localidad', p.localidad);
    campo('Pais', p.paisResidencia);
    campo('Email', p.email);
    campo('Codigo postal', p.codigoPostal);
    campo('Telefono', p.telefono);
    campo('Pasaporte', p.pasaporte);

    seccion('III. Antecedentes Bomberiles');
    doc.font('Helvetica-Bold').text('Cargos desempenados:');
    doc.font('Helvetica');
    if (snapshot.antecedentes.cargosDesempenados.length === 0) doc.text('Sin registros.');
    for (const c of snapshot.antecedentes.cargosDesempenados) {
      doc.text(`- ${c.cargo} (${c.periodo})${c.institucion ? ' - ' + c.institucion : ''}${c.resolucion ? ' - Res. ' + c.resolucion : ''}`);
    }
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text('Actividades destacadas:');
    doc.font('Helvetica');
    if (snapshot.antecedentes.actividadesDestacadas.length === 0) doc.text('Sin registros.');
    for (const a of snapshot.antecedentes.actividadesDestacadas) {
      doc.text(`- ${a.fecha}: ${a.descripcion}`);
    }

    seccion('IV. Especialidades Bomberiles');
    if (snapshot.especialidades.length === 0) doc.text('Sin especialidades registradas.');
    for (const e of snapshot.especialidades) {
      doc.text(`- ${e.especialidad}${e.nivel ? ' (' + e.nivel + ')' : ''}${e.vigencia ? ' - vigencia: ' + e.vigencia : ''}`);
    }

    seccion('V. Actividades Profesionales');
    if (!snapshot.actividadProfesional) {
      doc.text('Sin datos registrados.');
    } else {
      campo('Profesion', snapshot.actividadProfesional.profesion);
      campo('Empresa', snapshot.actividadProfesional.empresa);
      campo('Experiencia', snapshot.actividadProfesional.experiencia);
    }

    seccion('VI. Formacion');
    if (snapshot.formacion.length === 0) doc.text('Sin formacion registrada.');
    for (const f of snapshot.formacion) {
      doc.text(`- [${f.tipo}] ${f.nombre}${f.institucion ? ' - ' + f.institucion : ''} (${f.fecha})`);
    }

    seccion('VII. Idiomas');
    if (snapshot.idiomas.length === 0) doc.text('Sin idiomas registrados.');
    for (const i of snapshot.idiomas) {
      doc.text(`- ${i.idioma}${i.nivel ? ' (' + i.nivel + ')' : ''}`);
    }

    seccion('VIII. Otros');
    doc.font('Helvetica-Bold').text('Reconocimientos y distinciones:');
    doc.font('Helvetica');
    if (snapshot.otros.reconocimientos.length === 0) doc.text('Sin registros.');
    for (const r of snapshot.otros.reconocimientos) {
      doc.text(`- ${r.fecha}: ${r.descripcion}`);
    }
    if (snapshot.otros.observaciones) {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text('Observaciones: ', { continued: true });
      doc.font('Helvetica').text(snapshot.otros.observaciones);
    }

    doc.moveDown(1);
    doc.fontSize(8).fillColor('#64748b').text(`Generado: ${new Date(snapshot.generadoEn).toLocaleString('es-PY')}`);

    doc.end();
  });
}
