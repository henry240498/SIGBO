import { Module } from '@nestjs/common';
import { CronologiaService } from './cronologia.service';
import { MotorFases } from './motor-fases.service';

/** Bitacora y motor de fases del incidente. Sin dependencias de dominio: lo importan flota, campo, despacho e incidentes. */
@Module({
  providers: [CronologiaService, MotorFases],
  exports: [CronologiaService, MotorFases],
})
export class IncidenteNucleoModule {}