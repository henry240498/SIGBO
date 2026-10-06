import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import {
  CambiarEstadoLlamadoDto,
  CrearConvocatoriaDto,
  CrearLlamadoDto,
  MotivoConvocatoriaDto,
  ResponderConvocatoriaDto,
  VincularServicioDto,
} from './dto/llamados.dto';
import { LlamadosService } from './llamados.service';

/**
 * Cuadro de llamados del radio operador (2.1) y convocatorias al personal (2.2).
 * Llamados reutiliza servicios:ver/crear/editar; las convocatorias agregan
 * servicios:convocar. Responder solo exige servicios:ver (los usuarios de la app).
 */
@ApiTags('llamados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class LlamadosController {
  constructor(private readonly llamados: LlamadosService) {}

  private ctx(user: AuthenticatedUser, req: Request) {
    return { usuarioId: user.id, username: user.username, ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  // ---- llamados ----

  @Get('llamados')
  @RequirePermission('servicios:ver')
  listar(@Query('estado') estado?: string, @Query('limite') limite?: string) {
    const valido = estado === 'RECIBIDO' || estado === 'EN_ATENCION' || estado === 'CERRADO' ? estado : undefined;
    return this.llamados.listarLlamados({ estado: valido, limite: limite ? Number(limite) : undefined });
  }

  @Get('llamados/:id')
  @RequirePermission('servicios:ver')
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.llamados.obtenerLlamado(id);
  }

  @Post('llamados')
  @RequirePermission('servicios:crear')
  crear(@Body() dto: CrearLlamadoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.llamados.crearLlamado(dto, this.ctx(user, req));
  }

  @Patch('llamados/:id/estado')
  @RequirePermission('servicios:editar')
  cambiarEstado(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CambiarEstadoLlamadoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.llamados.cambiarEstadoLlamado(id, dto, this.ctx(user, req));
  }

  @Patch('llamados/:id/servicio')
  @RequirePermission('servicios:editar')
  vincular(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: VincularServicioDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.llamados.vincularServicio(id, dto.servicioId, this.ctx(user, req));
  }

  // ---- convocatorias ----

  /** Para la app: abiertas, con la respuesta propia. Va antes de `:id`. */
  @Get('convocatorias/abiertas')
  @RequirePermission('servicios:ver')
  abiertas(@CurrentUser() user: AuthenticatedUser) {
    return this.llamados.abiertasPara(user.id);
  }

  @Get('convocatorias')
  @RequirePermission('servicios:convocar')
  listarConvocatorias(@Query('limite') limite?: string) {
    return this.llamados.listarConvocatorias(limite ? Number(limite) : undefined);
  }

  @Get('convocatorias/:id')
  @RequirePermission('servicios:convocar')
  detalle(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.llamados.detalleConvocatoria(id);
  }

  @Post('convocatorias')
  @RequirePermission('servicios:convocar')
  crearConvocatoria(@Body() dto: CrearConvocatoriaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.llamados.crearConvocatoria(dto, this.ctx(user, req));
  }

  @Post('convocatorias/:id/respuesta')
  @RequirePermission('servicios:ver')
  responder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ResponderConvocatoriaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.llamados.responder(id, dto, this.ctx(user, req));
  }

  @Post('convocatorias/:id/en-camino')
  @RequirePermission('servicios:ver')
  enCamino(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.llamados.marcarEnCamino(id, this.ctx(user, req));
  }

  @Post('convocatorias/:id/cancelar-asistencia')
  @RequirePermission('servicios:ver')
  cancelarAsistencia(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: MotivoConvocatoriaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.llamados.cancelarAsistencia(id, dto.motivo, this.ctx(user, req));
  }

  @Patch('convocatorias/:id/cerrar')
  @RequirePermission('servicios:convocar')
  cerrar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.llamados.cerrarConvocatoria(id, this.ctx(user, req));
  }
}
