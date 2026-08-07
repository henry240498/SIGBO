import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { DuplicarRolDto } from './dto/duplicar-rol.dto';
import { CopiarPermisosDto } from './dto/copiar-permisos.dto';
import { SetPermisosDto } from './dto/set-permisos.dto';

function ctxDe(user: AuthenticatedUser, req: Request) {
  return { actorId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] as string };
}

@ApiTags('seguridad/roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('seguridad/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('seguridad:ver_usuarios')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermission('seguridad:ver_usuarios')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get(':id/permisos')
  @RequirePermission('seguridad:ver_usuarios')
  getPermisos(@Param('id') id: string) {
    return this.rolesService.getPermisos(id);
  }

  @Post()
  @RequirePermission('seguridad:crear_rol')
  create(@Body() dto: CreateRolDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.rolesService.create(dto, ctxDe(user, req));
  }

  @Patch(':id')
  @RequirePermission('seguridad:editar_rol')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRolDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.update(id, dto, ctxDe(user, req));
  }

  @Delete(':id')
  @RequirePermission('seguridad:eliminar_rol')
  eliminar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.rolesService.eliminar(id, ctxDe(user, req));
  }

  @Patch(':id/activo')
  @RequirePermission('seguridad:editar_rol')
  activar(
    @Param('id') id: string,
    @Body('activo') activo: boolean,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.activar(id, activo, ctxDe(user, req));
  }

  @Post(':id/duplicar')
  @RequirePermission('seguridad:crear_rol')
  duplicar(
    @Param('id') id: string,
    @Body() dto: DuplicarRolDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.duplicar(id, dto, ctxDe(user, req));
  }

  @Post(':id/copiar-permisos')
  @RequirePermission('seguridad:editar_rol')
  copiarPermisos(
    @Param('id') id: string,
    @Body() dto: CopiarPermisosDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.copiarPermisos(id, dto, ctxDe(user, req));
  }

  @Put(':id/permisos')
  @RequirePermission('seguridad:editar_rol')
  setPermisos(
    @Param('id') id: string,
    @Body() dto: SetPermisosDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.rolesService.setPermisos(id, dto, ctxDe(user, req));
  }
}
