import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import {
  ActualizarAptitudDto,
  ActualizarPuntoFichajeDto,
  CrearAptitudDto,
  CrearPuntoFichajeDto,
  EscanearDto,
  FijarLimitesHorasDto,
} from './dto/control-personal.dto';
import { FichajeService } from './fichaje.service';
import { HorasServicioService } from './horas-servicio.service';
import { VencimientosService } from './vencimientos.service';

/**
 * Control del personal: aptitudes y vencimientos (3.1), horas de servicio (3.3)
 * y fichaje por QR (3.5). Reutiliza permisos existentes de personal, guardias y
 * asistencia: el dato medico sigue protegido por personal:ver_medico / editar_medico.
 */
@ApiTags('control-personal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ControlPersonalController {
  constructor(
    private readonly vencimientos: VencimientosService,
    private readonly horas: HorasServicioService,
    private readonly fichaje: FichajeService,
  ) {}

  private ctx(user: AuthenticatedUser, req: Request) {
    return { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  // ---------------- 3.1 aptitudes y vencimientos ----------------

  @Get('aptitudes/vencimientos')
  @RequirePermission('personal:ver')
  verVencimientos(@Query('dias') dias: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    const n = Number(dias);
    return this.vencimientos.vencimientos(Number.isFinite(n) && n >= 0 ? Math.min(n, 365) : 30, {
      incluirMedicas: user.permisos.includes('personal:ver_medico'),
    });
  }

  @Get('aptitudes/bombero/:bomberoId')
  @RequirePermission('personal:ver')
  aptitudesDe(@Param('bomberoId', new ParseUUIDPipe()) bomberoId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.vencimientos.listarAptitudes(bomberoId, user.permisos.includes('personal:ver_medico'));
  }

  @Post('aptitudes')
  @RequirePermission('personal:editar')
  crearAptitud(@Body() dto: CrearAptitudDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    if (dto.categoria === 'MEDICA' && !user.permisos.includes('personal:editar_medico')) {
      throw new ForbiddenException('Registrar aptitudes medicas requiere personal:editar_medico.');
    }
    return this.vencimientos.crearAptitud(dto, this.ctx(user, req));
  }

  @Patch('aptitudes/:id')
  @RequirePermission('personal:editar')
  async actualizarAptitud(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarAptitudDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if ((await this.vencimientos.categoriaDe(id)) === 'MEDICA' && !user.permisos.includes('personal:editar_medico')) {
      throw new ForbiddenException('Modificar aptitudes medicas requiere personal:editar_medico.');
    }
    return this.vencimientos.actualizarAptitud(id, dto, this.ctx(user, req));
  }

  // ---------------- 3.3 horas de servicio ----------------

  @Get('horas-servicio')
  @RequirePermission('guardias:ver')
  resumenHoras(@Query('desde') desde?: string, @Query('hasta') hasta?: string, @Query('bomberoId') bomberoId?: string) {
    if (!desde || !hasta) throw new BadRequestException('Indique desde y hasta (AAAA-MM-DD).');
    return this.horas.resumen(desde, hasta, bomberoId);
  }

  @Get('horas-servicio/limites')
  @RequirePermission('guardias:ver')
  limites() {
    return this.horas.limitesActivos();
  }

  @Put('horas-servicio/limites')
  @RequirePermission('guardias:editar')
  fijarLimites(@Body() dto: FijarLimitesHorasDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.horas.fijarLimites(dto, this.ctx(user, req));
  }

  // ---------------- 3.5 fichaje por QR ----------------

  @Get('fichaje/puntos')
  @RequirePermission('asistencia:ver')
  puntos() {
    return this.fichaje.listarPuntos();
  }

  @Post('fichaje/puntos')
  @RequirePermission('asistencia:editar')
  crearPunto(@Body() dto: CrearPuntoFichajeDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.fichaje.crearPunto(dto.nombre, this.ctx(user, req));
  }

  @Patch('fichaje/puntos/:id')
  @RequirePermission('asistencia:editar')
  actualizarPunto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarPuntoFichajeDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.fichaje.actualizarPunto(id, dto, this.ctx(user, req));
  }

  @Post('fichaje/puntos/:id/regenerar')
  @RequirePermission('asistencia:editar')
  regenerar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.fichaje.regenerarToken(id, this.ctx(user, req));
  }

  @Post('fichaje/escanear')
  @RequirePermission('asistencia:marcar')
  escanear(@Body() dto: EscanearDto, @CurrentUser() user: AuthenticatedUser) {
    return this.fichaje.escanear(dto.token, user.id, new Date(), dto.ocurridoEn);
  }

  @Get('fichaje/mios')
  @RequirePermission('asistencia:marcar')
  mios(@CurrentUser() user: AuthenticatedUser) {
    return this.fichaje.misFichajes(user.id);
  }

  @Get('fichaje')
  @RequirePermission('asistencia:ver')
  delDia(@Query('fecha') fecha?: string) {
    const hoy = new Date();
    const porDefecto = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    return this.fichaje.deFecha(fecha ?? porDefecto);
  }
}
