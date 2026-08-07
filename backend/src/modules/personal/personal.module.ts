import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActividadProfesional,
  AsignacionGuardia,
  Bombero,
  BomberoEspecialidad,
  Cargo,
  Certificacion,
  Compania,
  CondicionApoyoEconomico,
  CondicionCombatiente,
  CondicionHonorario,
  CondicionIncorporado,
  Curso,
  Designacion,
  Especialidad,
  FojaServicio,
  Guardia,
  HistorialCodigo,
  HistorialInstitucional,
  IdiomaBombero,
  InscripcionCurso,
  Materia,
  PersonalServicio,
  Rango,
  Servicio,
  TipoServicio,
  VehiculoAutorizado,
} from '../../shared/entities';
import { BomberosService } from './bomberos.service';
import { BomberosController } from './bomberos.controller';
import { EspecialidadesBomberoService } from './especialidades-bombero.service';
import { EspecialidadesBomberoController } from './especialidades-bombero.controller';
import { FojaServicioService } from './foja-servicio.service';
import { FojaServicioController } from './foja-servicio.controller';
import { CondicionService } from './condicion.service';
import { CondicionController } from './condicion.controller';
import { HistorialInstitucionalService } from './historial-institucional.service';
import { HistorialInstitucionalController } from './historial-institucional.controller';
import { IdiomasService } from './idiomas.service';
import { IdiomasController } from './idiomas.controller';
import { ActividadProfesionalService } from './actividad-profesional.service';
import { ActividadProfesionalController } from './actividad-profesional.controller';
import { ConsultasCruzadasService } from './consultas-cruzadas.service';
import { ConsultasCruzadasController } from './consultas-cruzadas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bombero,
      BomberoEspecialidad,
      Especialidad,
      HistorialCodigo,
      HistorialInstitucional,
      CondicionIncorporado,
      CondicionCombatiente,
      CondicionApoyoEconomico,
      CondicionHonorario,
      ActividadProfesional,
      IdiomaBombero,
      VehiculoAutorizado,
      FojaServicio,
      Certificacion,
      Rango,
      Cargo,
      Compania,
      Designacion,
      Guardia,
      AsignacionGuardia,
      TipoServicio,
      Servicio,
      PersonalServicio,
      Materia,
      Curso,
      InscripcionCurso,
    ]),
  ],
  controllers: [
    BomberosController,
    EspecialidadesBomberoController,
    FojaServicioController,
    CondicionController,
    HistorialInstitucionalController,
    IdiomasController,
    ActividadProfesionalController,
    ConsultasCruzadasController,
  ],
  providers: [
    BomberosService,
    EspecialidadesBomberoService,
    FojaServicioService,
    CondicionService,
    HistorialInstitucionalService,
    IdiomasService,
    ActividadProfesionalService,
    ConsultasCruzadasService,
  ],
})
export class PersonalModule {}
