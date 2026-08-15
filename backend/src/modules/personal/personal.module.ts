import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeguridadModule } from '../seguridad/seguridad.module';
import {
  ActividadAcademica,
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
  Designacion,
  Especialidad,
  FojaServicio,
  Guardia,
  HistorialCodigo,
  HistorialInstitucional,
  IdiomaBombero,
  InscripcionActividadAcademica,
  Parametro,
  PersonalServicio,
  Rango,
  SeguroBombero,
  Servicio,
  TipoBombero,
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
import { TiposBomberoService } from './tipos-bombero.service';
import { TiposBomberoController } from './tipos-bombero.controller';
import { SegurosBomberoService } from './seguros-bombero.service';
import { SegurosBomberoController } from './seguros-bombero.controller';

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
      ActividadAcademica,
      InscripcionActividadAcademica,
      TipoBombero,
      Parametro,
      SeguroBombero,
    ]),
    SeguridadModule,
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
    TiposBomberoController,
    SegurosBomberoController,
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
    TiposBomberoService,
    SegurosBomberoService,
  ],
})
export class PersonalModule {}
