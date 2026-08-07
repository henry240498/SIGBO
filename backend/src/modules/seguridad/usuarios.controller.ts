import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResetearPasswordDto } from './dto/resetear-password.dto';
import { AsignarRolesDto } from './dto/asignar-roles.dto';
import { AsignarPermisoDirectoDto } from './dto/asignar-permiso-directo.dto';
import { BloqueoDto } from './dto/bloqueo.dto';

function ctxDe(user: AuthenticatedUser, req: Request) {
  return { actorId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] as string };
}

@ApiTags('seguridad/usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('seguridad/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @RequirePermission('seguridad:ver_usuarios')
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @RequirePermission('seguridad:ver_usuarios')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Get(':id/detalle')
  @RequirePermission('seguridad:ver_usuarios')
  detalle(@Param('id') id: string) {
    return this.usuariosService.detalle(id);
  }

  @Get(':id/roles')
  @RequirePermission('seguridad:ver_usuarios')
  getRoles(@Param('id') id: string) {
    return this.usuariosService.getRoles(id);
  }

  @Post()
  @RequirePermission('seguridad:crear_usuario')
  create(@Body() dto: CreateUsuarioDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.usuariosService.create(dto, ctxDe(user, req));
  }

  @Patch(':id')
  @RequirePermission('seguridad:editar_usuario')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.update(id, dto, ctxDe(user, req));
  }

  @Patch(':id/baja')
  @RequirePermission('seguridad:eliminar_usuario')
  darBaja(
    @Param('id') id: string,
    @Body('motivo') motivo: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.darBaja(id, motivo, ctxDe(user, req));
  }

  @Patch(':id/bloqueo')
  @RequirePermission('seguridad:editar_usuario')
  bloquear(
    @Param('id') id: string,
    @Body() dto: BloqueoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.bloquear(id, dto, ctxDe(user, req));
  }

  @Patch(':id/password')
  @RequirePermission('seguridad:editar_usuario')
  resetearPassword(
    @Param('id') id: string,
    @Body() dto: ResetearPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.resetearPassword(id, dto, ctxDe(user, req));
  }

  @Put(':id/roles')
  @RequirePermission('seguridad:editar_usuario')
  asignarRoles(
    @Param('id') id: string,
    @Body() dto: AsignarRolesDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.reemplazarRoles(id, dto.rolesIds, ctxDe(user, req));
  }

  @Put(':id/permisos')
  @RequirePermission('seguridad:editar_usuario')
  asignarPermisoDirecto(
    @Param('id') id: string,
    @Body() dto: AsignarPermisoDirectoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.asignarPermisoDirecto(id, dto, ctxDe(user, req));
  }

  @Delete(':id/permisos/:permisoId')
  @RequirePermission('seguridad:editar_usuario')
  quitarPermisoDirecto(
    @Param('id') id: string,
    @Param('permisoId') permisoId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.quitarPermisoDirecto(id, permisoId, ctxDe(user, req));
  }

  @Post(':id/cerrar-sesiones')
  @RequirePermission('seguridad:cerrar_sesion')
  cerrarSesiones(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.cerrarSesiones(id, ctxDe(user, req));
  }
}
