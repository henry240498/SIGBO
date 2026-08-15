import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SesionesAcademiaService } from './sesiones-academia.service';
import { CrearSesionAcademicaDto } from './dto/crear-sesion-academica.dto';

/** Sesiones/jornadas de una actividad academica -- cada una es un
 * operaciones.eventos_asistencia enlazado. La asistencia por sesion
 * (participantes, marcaciones, calculo de solapamiento) se gestiona con los
 * endpoints ya existentes de operaciones/eventos/:id/..., no se duplican
 * aqui (seccion 9-10 del pedido). */
@ApiTags('academia/sesiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/actividades')
export class SesionesAcademiaController {
  constructor(private readonly service: SesionesAcademiaService) {}

  @Get(':id/sesiones')
  @RequirePermission('academia:ver')
  listar(@Param('id') id: string) {
    return this.service.listarSesiones(id);
  }

  @Post(':id/sesiones')
  @RequirePermission('academia:registrar_asistencia')
  crear(
    @Param('id') id: string,
    @Body() dto: CrearSesionAcademicaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.crearSesion(id, dto, user.id, req.ip);
  }
}
