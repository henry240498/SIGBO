import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AsignacionPermisoDirecto,
  AsignacionPermisoRol,
  AsignacionRol,
  AsignacionGuardia,
  ConfiguracionSistema,
  Guardia,
  HistorialContrasena,
  LogAuditoria,
  Permiso,
  Rol,
  Sesion,
  Usuario,
  UsuarioCorreo,
  UsuarioTelefono,
  PersonalServicio,
  Servicio,
  TipoServicio,
} from '../../shared/entities';
import { PolicyEngineService } from './policy-engine.service';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { MeController } from './me.controller';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AparienciaService } from './apariencia.service';
import { AparienciaController } from './apariencia.controller';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      Permiso,
      AsignacionRol,
      AsignacionPermisoRol,
      AsignacionPermisoDirecto,
      HistorialContrasena,
      LogAuditoria,
      Sesion,
      ConfiguracionSistema,
      UsuarioTelefono,
      UsuarioCorreo,
      AsignacionGuardia,
      Guardia,
      PersonalServicio,
      Servicio,
      TipoServicio,
    ]),
  ],
  controllers: [
    RolesController,
    PermisosController,
    UsuariosController,
    MeController,
    AuditoriaController,
    SesionesController,
    DashboardController,
    AparienciaController,
    PerfilController,
  ],
  providers: [
    PolicyEngineService,
    RolesService,
    PermisosService,
    UsuariosService,
    AuditoriaService,
    SesionesService,
    DashboardService,
    AparienciaService,
    PerfilService,
  ],
  exports: [PolicyEngineService, AuditoriaService],
})
export class SeguridadModule {}
