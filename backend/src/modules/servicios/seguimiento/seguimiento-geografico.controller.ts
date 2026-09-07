import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { RequirePermission } from '../../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../../seguridad/guards/permissions.guard';
import {
  ActualizarEventoGeograficoDto,
  ActualizarPruebaComunicacionDto,
  CrearEventoGeograficoDto,
  CrearPruebaComunicacionDto,
  GuardarRutaPlanificadaDto,
} from './dto/seguimiento-geografico.dto';
import { SeguimientoGeograficoService } from './seguimiento-geografico.service';

/** Seguimiento Geografico y Operativo del Servicio: ruta planificada,
 * eventos del recorrido y pruebas de comunicacion sobre un mapa.
 * `servicios:ver_gps` gatea la seccion completa (igual que
 * `denuncias:ver_datos_tecnicos` gatea IP/GPS en Denuncias -- mismo
 * patron, ya probado en el sistema); `servicios:despachar` gatea
 * cualquier escritura. Ambos permisos ya existian sembrados y
 * asignados a roles, sin ningun endpoint que los usara. */
@ApiTags('servicios/seguimiento-geografico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('servicios/:servicioId/seguimiento')
export class SeguimientoGeograficoController {
  constructor(private readonly service: SeguimientoGeograficoService) {}

  @Get()
  @RequirePermission('servicios:ver_gps')
  resumen(@Param('servicioId', new ParseUUIDPipe()) servicioId: string) {
    return this.service.obtenerResumen(servicioId);
  }

  @Post('ruta-planificada')
  @RequirePermission('servicios:despachar')
  guardarRuta(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Body() dto: GuardarRutaPlanificadaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.guardarRutaPlanificada(servicioId, dto, user.id, req.ip);
  }

  @Delete('ruta-planificada')
  @RequirePermission('servicios:despachar')
  eliminarRuta(@Param('servicioId', new ParseUUIDPipe()) servicioId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.eliminarRutaPlanificada(servicioId, user.id, req.ip);
  }

  @Post('eventos')
  @RequirePermission('servicios:despachar')
  agregarEvento(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Body() dto: CrearEventoGeograficoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.agregarEvento(servicioId, dto, user.id, req.ip);
  }

  @Patch('eventos/:eventoId')
  @RequirePermission('servicios:despachar')
  actualizarEvento(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Param('eventoId', new ParseUUIDPipe()) eventoId: string,
    @Body() dto: ActualizarEventoGeograficoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.actualizarEvento(servicioId, eventoId, dto, user.id, req.ip);
  }

  @Delete('eventos/:eventoId')
  @RequirePermission('servicios:despachar')
  eliminarEvento(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Param('eventoId', new ParseUUIDPipe()) eventoId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.eliminarEvento(servicioId, eventoId, user.id, req.ip);
  }

  @Post('pruebas-comunicacion')
  @RequirePermission('servicios:despachar')
  agregarPrueba(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Body() dto: CrearPruebaComunicacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.agregarPruebaComunicacion(servicioId, dto, user.id, req.ip);
  }

  @Patch('pruebas-comunicacion/:pruebaId')
  @RequirePermission('servicios:despachar')
  actualizarPrueba(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Param('pruebaId', new ParseUUIDPipe()) pruebaId: string,
    @Body() dto: ActualizarPruebaComunicacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.actualizarPruebaComunicacion(servicioId, pruebaId, dto, user.id, req.ip);
  }

  @Delete('pruebas-comunicacion/:pruebaId')
  @RequirePermission('servicios:despachar')
  eliminarPrueba(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @Param('pruebaId', new ParseUUIDPipe()) pruebaId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.eliminarPruebaComunicacion(servicioId, pruebaId, user.id, req.ip);
  }
}
