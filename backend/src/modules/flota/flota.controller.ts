import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CrearDespachoDto, MotivoDto, RegresoDto, ReportarPosicionDto } from './dto/flota.dto';
import { ActualizarDotacionDto, ControlDotacionDto, CrearDotacionDto } from './dto/dotacion.dto';
import { DisponibilidadService } from './disponibilidad.service';
import { DotacionService } from './dotacion.service';
import { FlotaService } from './flota.service';
import { InformeService } from './informe.service';

/** Control de flota: tablero de moviles y despacho de unidades (migracion 077). */
@ApiTags('flota')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('flota')
export class FlotaController {
  constructor(
    private readonly flota: FlotaService,
    private readonly dotacion: DotacionService,
    private readonly disponibilidad: DisponibilidadService,
    private readonly informe: InformeService,
  ) {}

  private ctx(user: AuthenticatedUser, req: Request) {
    return { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  @Get('tablero')
  @RequirePermission('vehiculos:ver')
  tablero() {
    return this.flota.tablero();
  }

  @Get('posiciones')
  @RequirePermission('vehiculos:ver_mapa')
  posiciones() {
    return this.flota.posiciones();
  }

  @Get('moviles-reporte')
  @RequirePermission('vehiculos:posicion')
  movilesParaReporte() {
    return this.flota.movilesParaReporte();
  }

  @Get('vencimientos')
  @RequirePermission('vehiculos:ver')
  vencimientos(@Query('dias') dias?: string) {
    const n = Number(dias);
    return this.flota.vencimientos(Number.isFinite(n) && n >= 0 ? Math.min(n, 365) : 30);
  }

  @Post('moviles/:id/posicion')
  @RequirePermission('vehiculos:posicion')
  reportarPosicion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReportarPosicionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.flota.reportarPosicion(id, dto, user.id);
  }

  @Get('datos-pendientes')
  @RequirePermission('vehiculos:ver')
  datosPendientes() {
    return this.flota.datosPendientes();
  }

  @Get('servicios-abiertos')
  @RequirePermission('servicios:ver')
  serviciosAbiertos() {
    return this.flota.serviciosAbiertos();
  }

  @Get('moviles/:id/historial')
  @RequirePermission('vehiculos:ver')
  historial(@Param('id', new ParseUUIDPipe()) id: string, @Query('limite') limite?: string) {
    return this.flota.historialMovil(id, limite ? Number(limite) : undefined);
  }

  @Patch('moviles/:id/reponer-en-cuartel')
  @RequirePermission('vehiculos:estado')
  reponer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: MotivoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.flota.reponerEnCuartel(id, dto.motivo, this.ctx(user, req));
  }

  @Get('despachos')
  @RequirePermission('servicios:ver')
  listar(@Query('servicioId') servicioId?: string, @Query('activos') activos?: string, @Query('limite') limite?: string) {
    return this.flota.listarDespachos({
      servicioId,
      activos: activos === 'true',
      limite: limite ? Number(limite) : undefined,
    });
  }

  @Post('despachos')
  @RequirePermission('servicios:despachar')
  despachar(@Body() dto: CrearDespachoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.flota.despachar(dto, this.ctx(user, req));
  }

  @Patch('despachos/:id/llegada')
  @RequirePermission('servicios:despachar')
  llegada(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RegresoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.flota.avanzar(id, 'llegada', this.ctx(user, req), { ocurridoEn: dto.ocurridoEn });
  }

  @Patch('despachos/:id/fin')
  @RequirePermission('servicios:despachar')
  fin(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RegresoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.flota.avanzar(id, 'fin', this.ctx(user, req), { ocurridoEn: dto.ocurridoEn });
  }

  @Patch('despachos/:id/regreso')
  @RequirePermission('servicios:despachar')
  regreso(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RegresoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.flota.avanzar(id, 'regreso', this.ctx(user, req), { kmRegreso: dto.kmRegreso, ocurridoEn: dto.ocurridoEn });
  }

  @Patch('despachos/:id/cancelar')
  @RequirePermission('servicios:despachar')
  cancelar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: MotivoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.flota.cancelar(id, dto.motivo, this.ctx(user, req));
  }

  // ---- disponibilidad (2.3) ----

  @Get('disponibilidad')
  @RequirePermission('servicios:ver')
  disponibilidadAhora() {
    return this.disponibilidad.consultar();
  }

  // ---- dotacion por movil (1.7) y bitacora de uso (1.6) ----

  @Get('faltantes')
  @RequirePermission('vehiculos:ver')
  faltantes() {
    return this.dotacion.faltantes();
  }

  @Get('moviles/:id/dotacion')
  @RequirePermission('vehiculos:ver')
  dotacionDe(@Param('id', new ParseUUIDPipe()) id: string, @Query('inactivos') inactivos?: string) {
    return this.dotacion.listar(id, inactivos === 'true');
  }

  @Post('moviles/:id/dotacion')
  @RequirePermission('vehiculos:dotacion')
  crearDotacion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CrearDotacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.dotacion.crear(id, dto, this.ctx(user, req));
  }

  @Post('moviles/:id/dotacion/control')
  @RequirePermission('vehiculos:dotacion')
  controlDotacion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ControlDotacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.dotacion.registrarControl(id, dto, this.ctx(user, req));
  }

  @Patch('dotacion/:itemId')
  @RequirePermission('vehiculos:dotacion')
  actualizarDotacion(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: ActualizarDotacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.dotacion.actualizar(itemId, dto, this.ctx(user, req));
  }

  @Get('moviles/:id/bitacora')
  @RequirePermission('vehiculos:ver')
  bitacora(@Param('id', new ParseUUIDPipe()) id: string, @Query('limite') limite?: string) {
    return this.dotacion.bitacora(id, limite ? Number(limite) : undefined);
  }

  // ---- resumen operativo en PDF (2.4) ----

  @Get('informe/:servicioId/pdf')
  @ApiProduces('application/pdf')
  @RequirePermission('servicios:exportar_informe')
  async informePdf(
    @Param('servicioId', new ParseUUIDPipe()) servicioId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const archivo = await this.informe.generarPdf(servicioId, user.id, user.username);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${archivo.nombreArchivo}"`,
    });
    res.send(archivo.buffer);
  }
}
