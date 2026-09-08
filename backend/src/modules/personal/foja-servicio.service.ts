import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  ActividadProfesional,
  Bombero,
  BomberoEspecialidad,
  Cargo,
  Certificacion,
  Compania,
  Designacion,
  Especialidad,
  FojaServicio,
  HistorialInstitucional,
  IdiomaBombero,
  InscripcionActividadAcademica,
  Parametro,
  Rango,
} from '../../shared/entities';
import { generarFojaServicioPdf } from '../../shared/utils/foja-servicio-pdf';
import { generarFojaServicioDocx } from '../../shared/utils/foja-servicio-docx';
import { guardarBufferRestringido, leerBufferRestringido } from '../../shared/utils/almacenamiento';
import { FojaServicioSnapshot } from './types/foja-servicio-snapshot';

const CARPETA_FOJAS = 'fojas-servicio';

@Injectable()
export class FojaServicioService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Compania) private readonly companiaRepo: Repository<Compania>,
    @InjectRepository(BomberoEspecialidad) private readonly bomberoEspecialidadRepo: Repository<BomberoEspecialidad>,
    @InjectRepository(Especialidad) private readonly especialidadRepo: Repository<Especialidad>,
    @InjectRepository(Certificacion) private readonly certificacionRepo: Repository<Certificacion>,
    @InjectRepository(ActividadProfesional) private readonly actividadProfesionalRepo: Repository<ActividadProfesional>,
    @InjectRepository(IdiomaBombero) private readonly idiomaRepo: Repository<IdiomaBombero>,
    @InjectRepository(HistorialInstitucional) private readonly historialRepo: Repository<HistorialInstitucional>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(FojaServicio) private readonly fojaRepo: Repository<FojaServicio>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(InscripcionActividadAcademica) private readonly inscripcionAcademiaRepo: Repository<InscripcionActividadAcademica>,
    @InjectRepository(ActividadAcademica) private readonly actividadAcademicaRepo: Repository<ActividadAcademica>,
  ) {}

  private async armarSnapshot(bomberoId: string, anio: number): Promise<FojaServicioSnapshot> {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    const [rango, cargo, compania] = await Promise.all([
      bombero.rangoId ? this.rangoRepo.findOne({ where: { id: bombero.rangoId } }) : null,
      bombero.cargoPrincipalId ? this.cargoRepo.findOne({ where: { id: bombero.cargoPrincipalId } }) : null,
      bombero.companiaId ? this.companiaRepo.findOne({ where: { id: bombero.companiaId } }) : null,
    ]);

    const asignacionesEspecialidad = await this.bomberoEspecialidadRepo.find({ where: { bomberoId } });
    const especialidadesCatalogo = asignacionesEspecialidad.length
      ? await this.especialidadRepo
          .createQueryBuilder('e')
          .where('e.id IN (:...ids)', { ids: asignacionesEspecialidad.map((a) => a.especialidadId) })
          .getMany()
      : [];
    const mapaEspecialidades = new Map(especialidadesCatalogo.map((e) => [e.id, e]));

    const certificaciones = await this.certificacionRepo.find({ where: { bomberoId }, order: { fechaObtencion: 'DESC' } });
    const inscripcionesAcademia = await this.inscripcionAcademiaRepo.find({ where: { bomberoId } });
    const actividadesAcademicasCatalogo = inscripcionesAcademia.length
      ? await this.actividadAcademicaRepo
          .createQueryBuilder('a')
          .where('a.id IN (:...ids)', { ids: inscripcionesAcademia.map((i) => i.actividadId) })
          .getMany()
      : [];
    const mapaActividadesAcademicas = new Map(actividadesAcademicasCatalogo.map((a) => [a.id, a]));
    const resultadoAcademiaIds = [...new Set(inscripcionesAcademia.map((i) => i.resultadoFinalId).filter((id): id is string => !!id))];
    const resultadosAcademia = resultadoAcademiaIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: resultadoAcademiaIds }).getMany()
      : [];
    const mapaResultadosAcademia = new Map(resultadosAcademia.map((r) => [r.id, r.nombre]));
    const tipoActividadIds = [...new Set(actividadesAcademicasCatalogo.map((a) => a.tipoActividadId))];
    const tiposActividadAcademica = tipoActividadIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: tipoActividadIds }).getMany()
      : [];
    const mapaTiposActividadAcademica = new Map(tiposActividadAcademica.map((t) => [t.id, t.nombre]));
    const actividadProfesional = await this.actividadProfesionalRepo.findOne({ where: { bomberoId } });
    const idiomas = await this.idiomaRepo.find({ where: { bomberoId } });
    const movimientos = await this.historialRepo.find({ where: { bomberoId }, order: { fecha: 'DESC' } });
    const designaciones = await this.designacionRepo.find({ where: { bomberoId }, order: { fechaDesde: 'DESC' } });

    const cargosCatalogo = designaciones.length
      ? await this.cargoRepo.createQueryBuilder('c').where('c.id IN (:...ids)', { ids: designaciones.map((d) => d.cargoId) }).getMany()
      : [];
    const mapaCargos = new Map(cargosCatalogo.map((c) => [c.id, c]));

    const parametroIds = [
      bombero.grupoSanguineoId,
      bombero.paisId,
      bombero.ciudadId,
      actividadProfesional?.profesionId,
      ...idiomas.map((i) => i.idiomaId),
      ...idiomas.flatMap((i) => (i.nivelIdiomaId ? [i.nivelIdiomaId] : [])),
    ].filter((id): id is string => !!id);
    const parametros = parametroIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: [...new Set(parametroIds)] }).getMany()
      : [];
    const mapaParametros = new Map(parametros.map((p) => [p.id, p]));
    const nombreParametro = (id: string | null) => (id ? mapaParametros.get(id)?.nombre ?? null : null);

    return {
      anio,
      generadoEn: new Date().toISOString(),
      datosGenerales: {
        fotoUrl: bombero.fotoUrl,
        nombreCompleto: `${bombero.nombre} ${bombero.apellido}`,
        rango: rango?.nombre ?? bombero.rango ?? null,
        cargo: cargo?.nombre ?? bombero.cargo ?? null,
        categoria: bombero.condicionInstitucional,
        codigo: bombero.numeroBombero,
        cuadro: compania?.nombre ?? null,
        situacion: bombero.estado,
        fechaNacimiento: bombero.fechaNacimiento,
        documento: bombero.cedula,
        nacionalidad: bombero.nacionalidad,
        estadoCivil: bombero.estadoCivil,
        entidadIngreso: compania?.nombre ?? null,
        condicionIngreso: bombero.condicionInstitucional,
        fechaJuramento: bombero.fechaJuramento,
        grupoSanguineo: nombreParametro(bombero.grupoSanguineoId),
      },
      informacionPersonal: {
        direccion: bombero.direccion,
        localidad: nombreParametro(bombero.ciudadId),
        paisResidencia: nombreParametro(bombero.paisId),
        email: bombero.email,
        codigoPostal: bombero.codigoPostal,
        telefono: bombero.telefonoPrincipal,
        pasaporte: bombero.pasaporte,
      },
      antecedentes: {
        cargosDesempenados: designaciones.map((d) => ({
          cargo: mapaCargos.get(d.cargoId)?.nombre ?? d.cargoId,
          periodo: `${d.fechaDesde} - ${d.fechaHasta ?? 'actual'}`,
          institucion: null,
          resolucion: null,
        })),
        actividadesDestacadas: movimientos
          .filter((m) => m.tipoMovimiento === 'RECONOCIMIENTO')
          .map((m) => ({ fecha: m.fecha, descripcion: m.motivo ?? m.observacion ?? 'Reconocimiento' })),
      },
      especialidades: asignacionesEspecialidad.map((a) => ({
        especialidad: mapaEspecialidades.get(a.especialidadId)?.nombre ?? a.especialidadId,
        nivel: a.nivel,
        certificacion: a.institucionCertificadora,
        vigencia: a.vigencia,
      })),
      actividadProfesional: actividadProfesional
        ? {
            profesion: nombreParametro(actividadProfesional.profesionId),
            empresa: actividadProfesional.empresa,
            experiencia: actividadProfesional.experiencia,
          }
        : null,
      formacion: certificaciones.map((c) => ({
        nombre: c.nombre,
        tipo: c.tipo,
        institucion: c.institucion,
        fecha: c.fechaObtencion,
        duracionHoras: c.duracionHoras,
      })),
      actividadesAcademicas: inscripcionesAcademia
        .map((i) => {
          const actividad = mapaActividadesAcademicas.get(i.actividadId);
          if (!actividad) return null;
          return {
            nombre: actividad.nombre,
            tipo: mapaTiposActividadAcademica.get(actividad.tipoActividadId) ?? null,
            fechaInicio: actividad.fechaInicio,
            fechaFin: actividad.fechaFin,
            estado: i.estado,
            resultado: i.resultadoFinalId ? (mapaResultadosAcademia.get(i.resultadoFinalId) ?? null) : null,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => (a.fechaInicio < b.fechaInicio ? 1 : -1)),
      idiomas: idiomas.map((i) => ({
        idioma: nombreParametro(i.idiomaId) ?? '(parametro eliminado)',
        nivel: nombreParametro(i.nivelIdiomaId),
      })),
      otros: {
        reconocimientos: movimientos
          .filter((m) => m.tipoMovimiento === 'RECONOCIMIENTO')
          .map((m) => ({ fecha: m.fecha, descripcion: m.motivo ?? m.observacion ?? 'Reconocimiento' })),
        observaciones: null,
      },
    };
  }

  async generar(bomberoId: string, generadoPor: string, anio?: number): Promise<FojaServicio> {
    const anioObjetivo = anio ?? new Date().getFullYear();
    const snapshot = await this.armarSnapshot(bomberoId, anioObjetivo);

    const [pdfBuffer, docxBuffer] = await Promise.all([
      generarFojaServicioPdf(snapshot),
      generarFojaServicioDocx(snapshot),
    ]);

    const archivoPdfUrl = await guardarBufferRestringido(pdfBuffer, '.pdf', CARPETA_FOJAS);
    const archivoDocxUrl = await guardarBufferRestringido(docxBuffer, '.docx', CARPETA_FOJAS);

    const foja = this.fojaRepo.create({
      bomberoId,
      anio: anioObjetivo,
      generadoEn: new Date(),
      generadoPor,
      contenidoJson: JSON.stringify(snapshot),
      archivoPdfUrl,
      archivoDocxUrl,
    });
    return this.fojaRepo.save(foja);
  }

  async listarAnios(bomberoId: string): Promise<number[]> {
    const filas = await this.fojaRepo
      .createQueryBuilder('f')
      .select('DISTINCT f.anio', 'anio')
      .where('f.bomberoId = :bomberoId', { bomberoId })
      .orderBy('f.anio', 'DESC')
      .getRawMany();
    return filas.map((f) => f.anio);
  }

  async obtenerPorAnio(bomberoId: string, anio: number): Promise<FojaServicio> {
    const foja = await this.fojaRepo.findOne({ where: { bomberoId, anio }, order: { generadoEn: 'DESC' } });
    if (!foja) throw new NotFoundException(`No hay foja de servicio generada para el ano ${anio}`);
    return foja;
  }

  async descargarArchivo(bomberoId: string, anio: number, formato: 'pdf' | 'docx'): Promise<Buffer> {
    const foja = await this.obtenerPorAnio(bomberoId, anio);
    const ruta = formato === 'pdf' ? foja.archivoPdfUrl : foja.archivoDocxUrl;
    if (!ruta) throw new NotFoundException(`No hay archivo ${formato.toUpperCase()} para esta foja de servicio`);
    try {
      return await leerBufferRestringido(ruta, CARPETA_FOJAS);
    } catch {
      throw new NotFoundException('El archivo de la foja de servicio no está disponible');
    }
  }
}
