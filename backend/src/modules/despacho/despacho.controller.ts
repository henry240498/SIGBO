import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CambiarDisponibilidadDto, CerrarSolicitudDto, CrearExcepcionDto, CrearSolicitudDto, GuardarHorariosDto, ResponderDto } from './dto/despacho.dto';
import { DespachoTiempoReal } from './despacho-tiempo-real.service';
import { ContextoDespacho, DespachoService } from './despacho.service';

const LATIDO_SSE_MS = 25_000;

/**
 * Despacho y coordinacion operativa. Todo se valida en el backend: el permiso se exige
 * aca, la app solo oculta lo que no corresponde.
 *  - despacho:responder   cualquier persona del cuartel: recibe, responde, declara su disponibilidad
 *  - despacho:solicitar   crea, amplia y cierra solicitudes
 *  - despacho:seguimiento ve quien respondio y la linea de tiempo
 */
@ApiTags('despacho')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('despacho')
export class DespachoController {
  constructor(
    private readonly despacho: DespachoService,
    private readonly tiempoReal: DespachoTiempoReal,
  ) {}

  private ctx(user: AuthenticatedUser, req: Request): ContextoDespacho {
    return { usuarioId: user.id, username: user.username, ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  // ---- tiempo real y presencia

  /** Mantener este stream abierto es lo que cuenta como "en linea" para recibir llamados. */
  @Sse('stream')
  @RequirePermission('despacho:responder')
  stream(@CurrentUser() user: AuthenticatedUser): Observable<{ data: unknown }> {
    return new Observable((suscriptor) => {
      this.tiempoReal.conectar(user.id);
      const sub = this.tiempoReal.flujoPara(user.id, user.permisos.includes('despacho:seguimiento')).subscribe((e) => suscriptor.next({ data: e }));
      const reloj = setInterval(() => {
        this.tiempoReal.latido(user.id);
        suscriptor.next({ data: { tipo: 'latido', hora: new Date().toISOString() } });
      }, LATIDO_SSE_MS);
      return () => {
        clearInterval(reloj);
        sub.unsubscribe();
        this.tiempoReal.desconectar(user.id);
      };
    });
  }

  @Post('presencia')
  @RequirePermission('despacho:responder')
  presencia(@CurrentUser() user: AuthenticatedUser) {
    return this.despacho.latido(user.id);
  }

  // ---- disponibilidad propia

  @Get('disponibilidad/mia')
  @RequirePermission('despacho:responder')
  miDisponibilidad(@CurrentUser() user: AuthenticatedUser) {
    return this.despacho.miDisponibilidad(user.id);
  }

  @Put('disponibilidad/mia')
  @RequirePermission('despacho:responder')
  cambiarDisponibilidad(@Body() dto: CambiarDisponibilidadDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.cambiarDisponibilidad(dto, this.ctx(user, req));
  }

  @Put('disponibilidad/horarios')
  @RequirePermission('despacho:responder')
  guardarHorarios(@Body() dto: GuardarHorariosDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.guardarHorarios(dto, this.ctx(user, req));
  }

  @Post('disponibilidad/excepciones')
  @RequirePermission('despacho:responder')
  agregarExcepcion(@Body() dto: CrearExcepcionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.agregarExcepcion(dto, this.ctx(user, req));
  }

  @Delete('disponibilidad/excepciones/:id')
  @RequirePermission('despacho:responder')
  quitarExcepcion(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.quitarExcepcion(id, this.ctx(user, req));
  }

  // ---- solicitudes: quien recibe

  @Get('solicitudes/mias')
  @RequirePermission('despacho:responder')
  mias(@CurrentUser() user: AuthenticatedUser) {
    return this.despacho.misSolicitudes(user.id);
  }

  @Post('solicitudes/:id/recibida')
  @RequirePermission('despacho:responder')
  recibida(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.despacho.confirmarRecepcion(id, user.id);
  }

  @Post('solicitudes/:id/responder')
  @RequirePermission('despacho:responder')
  responder(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ResponderDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.responder(id, dto, this.ctx(user, req));
  }

  @Post('solicitudes/:id/unirme')
  @RequirePermission('despacho:responder')
  unirme(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.unirmeAmpliacion(id, this.ctx(user, req));
  }

  // ---- solicitudes: quien coordina

  @Post('solicitudes')
  @RequirePermission('despacho:solicitar')
  crear(@Body() dto: CrearSolicitudDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.crearSolicitud(dto, this.ctx(user, req));
  }

  @Get('solicitudes')
  @RequirePermission('despacho:seguimiento')
  listar(@Query('abiertas') abiertas?: string) {
    return this.despacho.listar(abiertas !== 'false');
  }

  @Get('solicitudes/:id')
  @RequirePermission('despacho:seguimiento')
  detalle(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.despacho.detalle(id);
  }

  @Get('solicitudes/:id/linea')
  @RequirePermission('despacho:seguimiento')
  linea(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.despacho.linea(id);
  }

  @Post('solicitudes/:id/ampliar')
  @RequirePermission('despacho:solicitar')
  ampliar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.ampliar(id, this.ctx(user, req));
  }

  @Post('solicitudes/:id/cerrar')
  @RequirePermission('despacho:solicitar')
  cerrar(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CerrarSolicitudDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.despacho.cerrar(id, dto, this.ctx(user, req));
  }
}
