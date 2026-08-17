import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActividadAcademica,
  AsignacionGuardia,
  Bombero,
  ConfiguracionIa,
  ConversacionIa,
  CursoExternoCache,
  EjecucionHerramientaIa,
  Equipo,
  Guardia,
  HistorialConfiguracionIa,
  IdentidadInstitucional,
  InscripcionActividadAcademica,
  MarcacionAsistencia,
  MensajeIa,
  MovimientoFinanciero,
  Parametro,
  PropuestaMejoraIa,
  Rango,
  Servicio,
  TipoBombero,
  Usuario,
  Articulo,
  Vehiculo,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { DocumentosModule } from '../documentos/documentos.module';
import { IaToolsService } from './tools/ia-tools.service';
import { IaConfiguracionService } from './ia-configuracion.service';
import { IaMotorService } from './ia-motor.service';
import { IaChatService } from './ia-chat.service';
import { IaConversacionesService } from './ia-conversaciones.service';
import { IaPropuestasMejoraService } from './ia-propuestas-mejora.service';
import { IaDashboardService } from './ia-dashboard.service';
import { IaRateLimitGuard } from './guards/ia-rate-limit.guard';
import { IaChatController } from './ia-chat.controller';
import { IaConfiguracionController, IaEstadoController } from './ia-configuracion.controller';
import { IaAdminConversacionesController } from './ia-admin-conversaciones.controller';
import { IaPropuestasMejoraController } from './ia-propuestas-mejora.controller';
import { IaDashboardController } from './ia-dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfiguracionIa,
      HistorialConfiguracionIa,
      ConversacionIa,
      MensajeIa,
      EjecucionHerramientaIa,
      PropuestaMejoraIa,
      // Entidades de otros modulos que las herramientas de la IA consultan
      // en solo lectura (mismo patron de bajo acoplamiento ya usado en
      // Deposito/Academia/Finanzas/Documentos): nunca se duplican, nunca
      // se escriben desde aca.
      Bombero,
      Guardia,
      AsignacionGuardia,
      Servicio,
      Vehiculo,
      Equipo,
      MarcacionAsistencia,
      ActividadAcademica,
      CursoExternoCache,
      MovimientoFinanciero,
      Articulo,
      IdentidadInstitucional,
      Parametro,
      Rango,
      TipoBombero,
      InscripcionActividadAcademica,
      Usuario,
    ]),
    SeguridadModule,
    DocumentosModule,
  ],
  controllers: [
    IaChatController,
    IaConfiguracionController,
    IaEstadoController,
    IaAdminConversacionesController,
    IaPropuestasMejoraController,
    IaDashboardController,
  ],
  providers: [
    IaToolsService,
    IaConfiguracionService,
    IaMotorService,
    IaChatService,
    IaConversacionesService,
    IaPropuestasMejoraService,
    IaDashboardService,
    IaRateLimitGuard,
  ],
})
export class IaModule {}
