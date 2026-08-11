import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { GuardiasService } from './guardias.service';
import { CreateGuardiaDto } from './dto/create-guardia.dto';
import { AsignarBomberoGuardiaDto } from './dto/asignar-bombero-guardia.dto';

@ApiTags('operaciones/guardias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/guardias')
export class GuardiasController {
  constructor(private readonly service: GuardiasService) {}

  @Get()
  @RequirePermission('asistencia:guardias_ver')
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.findAll(desde, hasta);
  }

  @Get(':id')
  @RequirePermission('asistencia:guardias_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('asistencia:guardias_crear')
  create(@Body() dto: CreateGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Get(':id/asignaciones')
  @RequirePermission('asistencia:guardias_ver')
  listarAsignaciones(@Param('id') id: string) {
    return this.service.listarAsignaciones(id);
  }

  @Post(':id/asignaciones')
  @RequirePermission('asistencia:guardias_editar')
  asignarBombero(
    @Param('id') id: string,
    @Body() dto: AsignarBomberoGuardiaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.asignarBombero(id, dto, user.id, req.ip);
  }

  @Delete(':id/asignaciones/:asignacionId')
  @RequirePermission('asistencia:guardias_editar')
  quitarAsignacion(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitarAsignacion(id, asignacionId, user.id, req.ip);
  }
}
