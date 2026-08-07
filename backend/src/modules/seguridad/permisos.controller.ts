import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

function ctxDe(user: AuthenticatedUser, req: Request) {
  return { actorId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] as string };
}

@ApiTags('seguridad/permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('seguridad/permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @RequirePermission('seguridad:ver_usuarios')
  findAll() {
    return this.permisosService.findAll();
  }

  @Post()
  @RequirePermission('seguridad:crear_permiso')
  create(@Body() dto: CreatePermisoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.permisosService.create(dto, ctxDe(user, req));
  }

  @Patch(':id')
  @RequirePermission('seguridad:editar_permiso')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePermisoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.permisosService.update(id, dto, ctxDe(user, req));
  }

  @Delete(':id')
  @RequirePermission('seguridad:eliminar_permiso')
  eliminar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.permisosService.eliminar(id, ctxDe(user, req));
  }
}
