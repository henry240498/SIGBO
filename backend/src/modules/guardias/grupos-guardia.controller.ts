import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { GruposGuardiaService } from './grupos-guardia.service';
import { CreateGrupoGuardiaDto, UpdateGrupoGuardiaDto } from './dto/create-grupo-guardia.dto';
import { AgregarMiembroGrupoDto } from './dto/agregar-miembro-grupo.dto';

@ApiTags('guardias/grupos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/grupos')
export class GruposGuardiaController {
  constructor(private readonly service: GruposGuardiaService) {}

  @Get()
  @RequirePermission('guardias:ver')
  findAll(@Query('estado') estado?: string) {
    return this.service.findAll(estado);
  }

  @Get(':id')
  @RequirePermission('guardias:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('guardias:crear')
  create(@Body() dto: CreateGrupoGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('guardias:editar')
  update(@Param('id') id: string, @Body() dto: UpdateGrupoGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Get(':id/miembros')
  @RequirePermission('guardias:ver')
  listarMiembros(@Param('id') id: string) {
    return this.service.listarMiembros(id);
  }

  @Post(':id/miembros')
  @RequirePermission('guardias:editar')
  agregarMiembro(
    @Param('id') id: string,
    @Body() dto: AgregarMiembroGrupoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.agregarMiembro(id, dto, user.id, req.ip);
  }

  @Delete(':id/miembros/:miembroId')
  @RequirePermission('guardias:editar')
  quitarMiembro(
    @Param('id') id: string,
    @Param('miembroId') miembroId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitarMiembro(id, miembroId, user.id, req.ip);
  }
}
