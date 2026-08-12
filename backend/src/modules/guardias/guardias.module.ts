import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AsignacionGuardia,
  Bombero,
  CambioGuardia,
  Cargo,
  ChecklistItemVehiculo,
  Designacion,
  Equipo,
  EsquemaHorarioGuardia,
  EventoAsistencia,
  Feriado,
  Guardia,
  GrupoGuardia,
  GrupoGuardiaMiembro,
  InspeccionEstacion,
  InspeccionMovil,
  MarcacionAsistencia,
  NovedadGuardia,
  OrdenGuardia,
  OrdenGuardiaConfiguracion,
  OrdenGuardiaModificacion,
  Parametro,
  ParticipanteEvento,
  Pernocte,
  PrestamoEquipo,
  Rango,
  RequisitoRolGuardia,
  Servicio,
  SorteoGuardia,
  SorteoParticipante,
  Usuario,
  Vehiculo,
  VehiculoAutorizado,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ElegibilidadService } from './elegibilidad.service';
import { GuardiasService } from './guardias.service';
import { GuardiasController } from './guardias.controller';
import { GruposGuardiaService } from './grupos-guardia.service';
import { GruposGuardiaController } from './grupos-guardia.controller';
import { PernoctesService } from './pernoctes.service';
import { PernoctesController } from './pernoctes.controller';
import { InspeccionesEstacionService } from './inspecciones-estacion.service';
import { InspeccionesEstacionController } from './inspecciones-estacion.controller';
import { NovedadesService } from './novedades.service';
import { NovedadesController } from './novedades.controller';
import { RequisitosRolService } from './requisitos-rol.service';
import { RequisitosRolController } from './requisitos-rol.controller';
import { EsquemasHorarioService } from './esquemas-horario.service';
import { EsquemasHorarioController } from './esquemas-horario.controller';
import { GeneracionService } from './generacion.service';
import { SorteosService } from './sorteos.service';
import { SorteosController } from './sorteos.controller';
import { InspeccionesMovilService } from './inspecciones-movil.service';
import { InspeccionesMovilController } from './inspecciones-movil.controller';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';
import { OrdenesGuardiaService } from './ordenes-guardia.service';
import { OrdenesGuardiaController } from './ordenes-guardia.controller';
import { OrdenGuardiaConfiguracionService } from './orden-guardia-configuracion.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guardia,
      AsignacionGuardia,
      CambioGuardia,
      GrupoGuardia,
      GrupoGuardiaMiembro,
      Pernocte,
      InspeccionEstacion,
      NovedadGuardia,
      RequisitoRolGuardia,
      EsquemaHorarioGuardia,
      Feriado,
      Rango,
      SorteoGuardia,
      SorteoParticipante,
      InspeccionMovil,
      Vehiculo,
      ChecklistItemVehiculo,
      Equipo,
      Servicio,
      EventoAsistencia,
      ParticipanteEvento,
      PrestamoEquipo,
      Bombero,
      MarcacionAsistencia,
      Parametro,
      Usuario,
      VehiculoAutorizado,
      OrdenGuardia,
      OrdenGuardiaConfiguracion,
      OrdenGuardiaModificacion,
      Cargo,
      Designacion,
    ]),
    SeguridadModule,
  ],
  controllers: [
    GuardiasController,
    GruposGuardiaController,
    PernoctesController,
    InspeccionesEstacionController,
    NovedadesController,
    RequisitosRolController,
    EsquemasHorarioController,
    SorteosController,
    InspeccionesMovilController,
    BitacoraController,
    OrdenesGuardiaController,
  ],
  providers: [
    ElegibilidadService,
    GuardiasService,
    GruposGuardiaService,
    PernoctesService,
    InspeccionesEstacionService,
    NovedadesService,
    RequisitosRolService,
    EsquemasHorarioService,
    GeneracionService,
    SorteosService,
    InspeccionesMovilService,
    BitacoraService,
    OrdenesGuardiaService,
    OrdenGuardiaConfiguracionService,
  ],
  exports: [GuardiasService],
})
export class GuardiasModule {}
