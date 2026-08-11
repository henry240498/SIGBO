import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { EventosAsistenciaService } from './eventos-asistencia.service';
import { CreateEventoAsistenciaDto } from './dto/create-evento-asistencia.dto';
import { UpdateEventoAsistenciaDto } from './dto/update-evento-asistencia.dto';
import { AgregarParticipanteDto } from './dto/agregar-participante.dto';
import { ActualizarParticipacionDto } from './dto/actualizar-participacion.dto';

@ApiTags('operaciones/eventos-asistencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/eventos')
export class EventosAsistenciaController {
  constructor(private readonly service: EventosAsistenciaService) {}

  @Get()
  @RequirePermission('asistencia:eventos_ver')
  findAll(
    @Query('tipoEventoId') tipoEventoId?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll(tipoEventoId, estado, desde, hasta);
  }

  @Get(':id')
  @RequirePermission('asistencia:eventos_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('asistencia:eventos_crear')
  create(@Body() dto: CreateEventoAsistenciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('asistencia:eventos_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventoAsistenciaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Get(':id/participantes')
  @RequirePermission('asistencia:eventos_ver')
  listarParticipantes(@Param('id') id: string) {
    return this.service.listarParticipantes(id);
  }

  @Post(':id/participantes')
  @RequirePermission('asistencia:eventos_editar')
  agregarParticipante(
    @Param('id') id: string,
    @Body() dto: AgregarParticipanteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.agregarParticipante(id, dto, user.id, req.ip);
  }

  @Patch(':id/participantes/:participanteId')
  @RequirePermission('asistencia:eventos_editar')
  actualizarParticipacion(
    @Param('id') id: string,
    @Param('participanteId') participanteId: string,
    @Body() dto: ActualizarParticipacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.actualizarParticipacion(id, participanteId, dto, user.id, req.ip);
  }

  @Post(':id/participantes/:participanteId/calcular-desde-marcaciones')
  @RequirePermission('asistencia:eventos_editar')
  calcularDesdeMarcaciones(
    @Param('id') id: string,
    @Param('participanteId') participanteId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.calcularYAplicarParticipacion(id, participanteId, user.id, req.ip);
  }

  @Delete(':id/participantes/:participanteId')
  @RequirePermission('asistencia:eventos_editar')
  quitarParticipante(
    @Param('id') id: string,
    @Param('participanteId') participanteId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitarParticipante(id, participanteId, user.id, req.ip);
  }
}
