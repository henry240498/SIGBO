import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AsignacionGuardia,
  Bombero,
  CambioGuardia,
  EventoAsistencia,
  Guardia,
  ImportacionMarcador,
  ImportacionMarcadorFila,
  MarcacionAsistencia,
  Parametro,
  ParticipanteEvento,
  ParticipanteExterno,
  ToleranciaAsistencia,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { EventosAsistenciaService } from './eventos-asistencia.service';
import { EventosAsistenciaController } from './eventos-asistencia.controller';
import { MarcacionesService } from './marcaciones.service';
import { MarcacionesController } from './marcaciones.controller';
import { GuardiasService } from './guardias.service';
import { GuardiasController } from './guardias.controller';
import { ParticipantesExternosService } from './participantes-externos.service';
import { ParticipantesExternosController } from './participantes-externos.controller';
import { ToleranciasService } from './tolerancias.service';
import { ToleranciasController } from './tolerancias.controller';
import { DashboardAsistenciaService } from './dashboard-asistencia.service';
import { DashboardAsistenciaController } from './dashboard-asistencia.controller';
import { ImportacionesService } from './importaciones.service';
import { ImportacionesController } from './importaciones.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventoAsistencia,
      MarcacionAsistencia,
      ParticipanteEvento,
      ParticipanteExterno,
      CambioGuardia,
      ToleranciaAsistencia,
      ImportacionMarcador,
      ImportacionMarcadorFila,
      Guardia,
      AsignacionGuardia,
      Bombero,
      Parametro,
    ]),
    SeguridadModule,
  ],
  controllers: [
    EventosAsistenciaController,
    MarcacionesController,
    GuardiasController,
    ParticipantesExternosController,
    ToleranciasController,
    DashboardAsistenciaController,
    ImportacionesController,
  ],
  providers: [
    EventosAsistenciaService,
    MarcacionesService,
    GuardiasService,
    ParticipantesExternosService,
    ToleranciasService,
    DashboardAsistenciaService,
    ImportacionesService,
  ],
})
export class OperacionesModule {}
