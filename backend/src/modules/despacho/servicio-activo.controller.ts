import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { AnularRespuestaFormularioDto, CambiarEstadoParticipanteDto, CrearRespuestaFormularioDto, DefinicionFormularioDto, EnviarMensajeDto, ModificarRespuestaFormularioDto } from './dto/servicio-activo.dto';
import { ServicioActivoService } from './servicio-activo.service';

@ApiTags('despacho-servicio-activo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('despacho')
export class ServicioActivoController {
  constructor(private readonly servicio: ServicioActivoService) {}

  @Get('servicios-activos')
  @RequirePermission('despacho:servicio')
  activos(@CurrentUser() user: AuthenticatedUser) { return this.servicio.activos(user); }

  @Get('servicios/:id')
  @RequirePermission('despacho:servicio')
  detalle(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) { return this.servicio.detalle(id, user); }

  @Post('servicios/:id/unirme')
  @RequirePermission('despacho:servicio')
  unirme(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) { return this.servicio.unirme(id, user); }

  @Patch('servicios/:id/mi-estado')
  @RequirePermission('despacho:servicio')
  estado(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CambiarEstadoParticipanteDto, @CurrentUser() user: AuthenticatedUser) { return this.servicio.cambiarEstadoParticipacion(id, dto.estado, user); }

  @Get('servicios/:id/mapa')
  @RequirePermission('despacho:servicio')
  mapa(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.servicio.mapa(id, user);
  }

  @Get('servicios/:id/mensajes')
  @RequirePermission('despacho:servicio')
  mensajes(@Param('id', new ParseUUIDPipe()) id: string, @Query('desdeId') desdeId: string | undefined, @CurrentUser() user: AuthenticatedUser) { return this.servicio.mensajes(id, user, desdeId); }

  @Post('servicios/:id/mensajes')
  @RequirePermission('despacho:servicio')
  enviarMensaje(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: EnviarMensajeDto, @CurrentUser() user: AuthenticatedUser) { return this.servicio.enviarMensaje(id, dto, user); }

  @Get('servicios/:id/formularios')
  @RequirePermission('despacho:servicio')
  formularios(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) { return this.servicio.formularios(id, user); }

  @Post('servicios/:id/formularios')
  @RequirePermission('despacho:servicio')
  crearRespuesta(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CrearRespuestaFormularioDto, @CurrentUser() user: AuthenticatedUser) { return this.servicio.crearRespuesta(id, dto, user); }

  @Patch('formularios/:id')
  @RequirePermission('despacho:servicio')
  modificarRespuesta(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ModificarRespuestaFormularioDto, @CurrentUser() user: AuthenticatedUser) { return this.servicio.modificarRespuesta(id, dto, user); }

  @Post('formularios/:id/anular')
  @RequirePermission('despacho:servicio')
  anularRespuesta(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: AnularRespuestaFormularioDto, @CurrentUser() user: AuthenticatedUser) { return this.servicio.anularRespuesta(id, dto, user); }

  @Get('formularios/:id/historial')
  @RequirePermission('despacho:servicio')
  historialRespuesta(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) { return this.servicio.historialRespuesta(id, user); }

  @Post('formularios-definiciones')
  @RequirePermission('despacho:formularios_admin')
  definicion(@Body() dto: DefinicionFormularioDto, @CurrentUser() user: AuthenticatedUser) { return this.servicio.guardarDefinicion(dto, user); }
}
