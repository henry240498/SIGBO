import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Ascenso,
  Bombero,
  Brigada,
  Cargo,
  Compania,
  Cuartel,
  Departamento,
  Designacion,
  Especialidad,
  Feriado,
  Guardia,
  Parametro,
  Rango,
  TipoGuardia,
  Turno,
  Unidad,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';

import { RangosService } from './rangos.service';
import { RangosController } from './rangos.controller';
import { CargosService } from './cargos.service';
import { CargosController } from './cargos.controller';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadesController } from './especialidades.controller';
import { CompaniasService } from './companias.service';
import { CompaniasController } from './companias.controller';
import { CuartelsService } from './cuarteles.service';
import { CuartelsController } from './cuarteles.controller';
import { BrigadasService } from './brigadas.service';
import { BrigadasController } from './brigadas.controller';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosController } from './departamentos.controller';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { TiposGuardiaService } from './tipos-guardia.service';
import { TiposGuardiaController } from './tipos-guardia.controller';
import { DesignacionesService } from './designaciones.service';
import { DesignacionesController } from './designaciones.controller';
import { AscensosService } from './ascensos.service';
import { AscensosController } from './ascensos.controller';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ParametrosService } from './parametros.service';
import { ParametrosController } from './parametros.controller';
import { FeriadosService } from './feriados.service';
import { FeriadosController } from './feriados.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rango,
      Cargo,
      Especialidad,
      Compania,
      Cuartel,
      Brigada,
      Departamento,
      Unidad,
      Turno,
      TipoGuardia,
      Designacion,
      Ascenso,
      Bombero,
      Parametro,
      Feriado,
      Guardia,
    ]),
    SeguridadModule,
  ],
  controllers: [
    RangosController,
    CargosController,
    EspecialidadesController,
    CompaniasController,
    CuartelsController,
    BrigadasController,
    DepartamentosController,
    UnidadesController,
    TurnosController,
    TiposGuardiaController,
    DesignacionesController,
    AscensosController,
    DashboardController,
    ParametrosController,
    FeriadosController,
  ],
  providers: [
    RangosService,
    CargosService,
    EspecialidadesService,
    CompaniasService,
    CuartelsService,
    BrigadasService,
    DepartamentosService,
    UnidadesService,
    TurnosService,
    TiposGuardiaService,
    DesignacionesService,
    AscensosService,
    DashboardService,
    ParametrosService,
    FeriadosService,
  ],
  exports: [ParametrosService],
})
export class OrganizacionModule {}
