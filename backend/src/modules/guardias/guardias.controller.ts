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
import { AsignarPersonalDto } from './dto/asignar-personal.dto';
import { RegistrarHorarioDto } from './dto/registrar-horario.dto';
import { ActualizarPresenciaDto } from './dto/actualizar-presencia.dto';

@ApiTags('guardias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias')
export class GuardiasController {
  constructor(private readonly service: GuardiasService) {}

  @Get()
  @RequirePermission('guardias:ver')
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.findAll(desde, hasta);
  }

  @Get(':id')
  @RequirePermission('guardias:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('guardias:crear')
  create(@Body() dto: CreateGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Get(':id/asignaciones')
  @RequirePermission('guardias:ver')
  listarAsignaciones(@Param('id') id: string) {
    return this.service.listarAsignaciones(id);
  }

  @Post(':id/asignaciones')
  @RequirePermission('guardias:asignar')
  asignarPersonal(
    @Param('id') id: string,
    @Body() dto: AsignarPersonalDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.asignarPersonal(id, dto, user.id, req.ip);
  }

  @Delete(':id/asignaciones/:asignacionId')
  @RequirePermission('guardias:editar')
  quitarAsignacion(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitarAsignacion(id, asignacionId, user.id, req.ip);
  }

  @Post(':id/asignaciones/:asignacionId/horario')
  @RequirePermission('guardias:editar')
  registrarHorario(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @Body() dto: RegistrarHorarioDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarHorario(id, asignacionId, dto, user.id, req.ip);
  }

  @Post(':id/asignaciones/:asignacionId/presencia')
  @RequirePermission('guardias:editar')
  actualizarPresencia(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @Body() dto: ActualizarPresenciaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.actualizarPresencia(id, asignacionId, dto, user.id, req.ip);
  }

  @Get(':id/cumplimiento/:bomberoId')
  @RequirePermission('guardias:ver')
  calcularCumplimiento(@Param('id') id: string, @Param('bomberoId') bomberoId: string) {
    return this.service.calcularCumplimiento(id, bomberoId);
  }
}
