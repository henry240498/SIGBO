import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AsignacionGuardia,
  Bombero,
  CambioGuardia,
  Guardia,
  GrupoGuardia,
  GrupoGuardiaMiembro,
  InspeccionEstacion,
  MarcacionAsistencia,
  NovedadGuardia,
  Parametro,
  Pernocte,
  RequisitoRolGuardia,
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
      Bombero,
      MarcacionAsistencia,
      Parametro,
      VehiculoAutorizado,
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
  ],
  providers: [
    ElegibilidadService,
    GuardiasService,
    GruposGuardiaService,
    PernoctesService,
    InspeccionesEstacionService,
    NovedadesService,
    RequisitosRolService,
  ],
  exports: [GuardiasService],
})
export class GuardiasModule {}
