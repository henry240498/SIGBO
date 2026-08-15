import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActividadAcademica,
  Bombero,
  Cargo,
  Certificacion,
  CursoExternoCache,
  Designacion,
  EvaluacionAcademica,
  EventoAsistencia,
  HistorialInstitucional,
  IdentidadInstitucional,
  InscripcionActividadAcademica,
  InstructorActividadAcademica,
  InstructorExterno,
  NotaEvaluacionAcademica,
  ParticipanteExterno,
  Parametro,
  Rango,
  Usuario,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { OperacionesModule } from '../operaciones/operaciones.module';
import { DocumentosModule } from '../documentos/documentos.module';
import { ActividadesAcademicasService } from './actividades-academicas.service';
import { ActividadesAcademicasController } from './actividades-academicas.controller';
import { InstructoresExternosService } from './instructores-externos.service';
import { InstructoresExternosController } from './instructores-externos.controller';
import { InscripcionesAcademiaService } from './inscripciones-academia.service';
import { InscripcionesAcademiaController } from './inscripciones-academia.controller';
import { SesionesAcademiaService } from './sesiones-academia.service';
import { SesionesAcademiaController } from './sesiones-academia.controller';
import { EvaluacionesAcademiaService } from './evaluaciones-academia.service';
import { EvaluacionesAcademiaController } from './evaluaciones-academia.controller';
import { CertificacionesAcademiaService } from './certificaciones-academia.service';
import { CertificacionesAcademiaController } from './certificaciones-academia.controller';
import { CursosExternosService } from './cursos-externos.service';
import { CursosExternosController } from './cursos-externos.controller';
import { ReportesAcademiaService } from './reportes-academia.service';
import { ReportesAcademiaController } from './reportes-academia.controller';
import { ConsultasAcademiaService } from './consultas-academia.service';
import { ConsultasAcademiaController } from './consultas-academia.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActividadAcademica,
      InstructorActividadAcademica,
      InstructorExterno,
      InscripcionActividadAcademica,
      EvaluacionAcademica,
      NotaEvaluacionAcademica,
      // Entidades de otros modulos que Academia consulta directamente
      // (mismo patron de bajo acoplamiento ya usado en GuardiasModule):
      // nunca se duplican sus estructuras.
      Bombero,
      Rango,
      Cargo,
      Designacion,
      Parametro,
      ParticipanteExterno,
      EventoAsistencia,
      Certificacion,
      Usuario,
      HistorialInstitucional,
      CursoExternoCache,
      IdentidadInstitucional,
    ]),
    SeguridadModule,
    OperacionesModule,
    DocumentosModule,
  ],
  controllers: [
    ActividadesAcademicasController,
    InstructoresExternosController,
    InscripcionesAcademiaController,
    SesionesAcademiaController,
    EvaluacionesAcademiaController,
    CertificacionesAcademiaController,
    CursosExternosController,
    ReportesAcademiaController,
    ConsultasAcademiaController,
  ],
  providers: [
    ActividadesAcademicasService,
    InstructoresExternosService,
    InscripcionesAcademiaService,
    SesionesAcademiaService,
    EvaluacionesAcademiaService,
    CertificacionesAcademiaService,
    CursosExternosService,
    ReportesAcademiaService,
    ConsultasAcademiaService,
  ],
})
export class AcademiaModule {}
