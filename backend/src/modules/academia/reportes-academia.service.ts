import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadAcademica, Bombero, Cargo, Designacion, IdentidadInstitucional, Parametro, Rango } from '../../shared/entities';
import { resolverEncabezadoInstitucional } from '../../shared/utils/identidad-institucional';
import { resolverFirmante } from '../../shared/utils/firmantes-institucionales';
import { generarReporteActividadAcademicaPdf } from '../../shared/utils/reporte-actividad-academica-pdf';
import { generarReporteActividadAcademicaDocx } from '../../shared/utils/reporte-actividad-academica-docx';
import { guardarBuffer } from '../../shared/utils/almacenamiento';
import { ActividadesAcademicasService } from './actividades-academicas.service';
import { InscripcionesAcademiaService } from './inscripciones-academia.service';
import { ReporteActividadSnapshot } from './types/reporte-actividad-snapshot';

const CARPETA_REPORTES = 'reportes-academia';

@Injectable()
export class ReportesAcademiaService {
  constructor(
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(IdentidadInstitucional) private readonly identidadRepo: Repository<IdentidadInstitucional>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    private readonly actividadesService: ActividadesAcademicasService,
    private readonly inscripcionesService: InscripcionesAcademiaService,
  ) {}

  private async armarSnapshot(actividadId: string, cargoFirmanteId?: string): Promise<ReporteActividadSnapshot> {
    const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${actividadId} no encontrada`);

    const [tipo, modalidad, instructores, participantes, institucional] = await Promise.all([
      this.parametroRepo.findOne({ where: { id: actividad.tipoActividadId } }),
      actividad.modalidadId ? this.parametroRepo.findOne({ where: { id: actividad.modalidadId } }) : Promise.resolve(null),
      this.actividadesService.listarInstructores(actividadId),
      this.inscripcionesService.listarParticipantes(actividadId),
      resolverEncabezadoInstitucional(this.identidadRepo),
    ]);

    const firmante = cargoFirmanteId
      ? await resolverFirmante(
          { cargoRepo: this.cargoRepo, designacionRepo: this.designacionRepo, bomberoRepo: this.bomberoRepo, rangoRepo: this.rangoRepo },
          cargoFirmanteId,
          null,
        )
      : null;

    const porEstado: Record<string, number> = {};
    const porResultado: Record<string, number> = {};
    for (const p of participantes) {
      porEstado[p.estado] = (porEstado[p.estado] ?? 0) + 1;
      if (p.resultadoFinal) porResultado[p.resultadoFinal] = (porResultado[p.resultadoFinal] ?? 0) + 1;
    }

    return {
      generadoEn: new Date().toISOString(),
      institucional,
      actividad: {
        nombre: actividad.nombre,
        codigo: actividad.codigo,
        tipo: tipo?.nombre ?? null,
        modalidad: modalidad?.nombre ?? null,
        fechaInicio: actividad.fechaInicio,
        fechaFin: actividad.fechaFin,
        lugar: actividad.lugar,
        descripcion: actividad.descripcion,
        objetivo: actividad.objetivo,
        estado: actividad.estado,
        duracionHoras: actividad.duracionHoras,
        esExterna: actividad.esExterna,
      },
      instructores: instructores.map((i) => ({
        nombreCompleto: i.nombreCompleto,
        tipo: i.tipo,
        rolInstructor: i.rolInstructor,
        detalle: i.tipo === 'PERSONAL' ? (i.rango ?? null) : [i.institucion, i.especialidad].filter(Boolean).join(' - ') || null,
      })),
      participantes: participantes.map((p) => ({
        nombreCompleto: p.nombreCompleto,
        tipo: p.tipo,
        fechaInscripcion: p.fechaInscripcion,
        estado: p.estado,
        resultado: p.resultadoFinal,
      })),
      indicadores: { totalParticipantes: participantes.length, porEstado, porResultado },
      firmante,
    };
  }

  async generarPdf(actividadId: string, cargoFirmanteId?: string): Promise<string> {
    const snapshot = await this.armarSnapshot(actividadId, cargoFirmanteId);
    const buffer = await generarReporteActividadAcademicaPdf(snapshot);
    return guardarBuffer(buffer, '.pdf', CARPETA_REPORTES);
  }

  async generarDocx(actividadId: string, cargoFirmanteId?: string): Promise<string> {
    const snapshot = await this.armarSnapshot(actividadId, cargoFirmanteId);
    const buffer = await generarReporteActividadAcademicaDocx(snapshot);
    return guardarBuffer(buffer, '.docx', CARPETA_REPORTES);
  }
}
