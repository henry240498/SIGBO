import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CartografiaService } from './cartografia.service';
import {
  ActualizarHidranteDto,
  ActualizarPuntoRiesgoDto,
  CrearHidranteDto,
  CrearPuntoRiesgoDto,
  GuardarPreplanDto,
} from './dto/cartografia.dto';

/** Hidrantes, puntos de riesgo y pre-planes. Reutiliza servicios:ver / crear / editar. */
@ApiTags('cartografia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cartografia')
export class CartografiaController {
  constructor(private readonly carto: CartografiaService) {}

  private ctx(user: AuthenticatedUser, req: Request) {
    return { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  @Get('cercanos')
  @RequirePermission('servicios:ver')
  cercanos(@Query('lat') lat: string, @Query('lon') lon: string, @Query('radio') radio?: string) {
    const la = Number(lat);
    const lo = Number(lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      throw new BadRequestException('lat y lon deben ser coordenadas validas.');
    }
    const r = Number(radio);
    return this.carto.cercanos(la, lo, Number.isFinite(r) && r > 0 ? Math.min(r, 20000) : 1000);
  }

  @Get('hidrantes')
  @RequirePermission('servicios:ver')
  hidrantes(@Query('estado') estado?: string, @Query('inactivos') inactivos?: string) {
    const valido = ['OPERATIVO', 'FUERA_SERVICIO', 'SIN_VERIFICAR'].includes(estado ?? '') ? estado : undefined;
    return this.carto.listarHidrantes({ estado: valido, incluirInactivos: inactivos === 'true' });
  }

  @Post('hidrantes')
  @RequirePermission('servicios:crear')
  crearHidrante(@Body() dto: CrearHidranteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.carto.crearHidrante(dto, this.ctx(user, req));
  }

  @Patch('hidrantes/:id')
  @RequirePermission('servicios:editar')
  actualizarHidrante(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarHidranteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.carto.actualizarHidrante(id, dto, this.ctx(user, req));
  }

  @Get('puntos-riesgo')
  @RequirePermission('servicios:ver')
  puntos(@Query('inactivos') inactivos?: string) {
    return this.carto.listarPuntos({ incluirInactivos: inactivos === 'true' });
  }

  @Post('puntos-riesgo')
  @RequirePermission('servicios:crear')
  crearPunto(@Body() dto: CrearPuntoRiesgoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.carto.crearPunto(dto, this.ctx(user, req));
  }

  @Patch('puntos-riesgo/:id')
  @RequirePermission('servicios:editar')
  actualizarPunto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarPuntoRiesgoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.carto.actualizarPunto(id, dto, this.ctx(user, req));
  }

  @Get('puntos-riesgo/:id/preplan')
  @RequirePermission('servicios:ver')
  preplan(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.carto.preplanVigente(id);
  }

  @Get('puntos-riesgo/:id/preplan/historial')
  @RequirePermission('servicios:ver')
  historialPreplan(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.carto.historialPreplan(id);
  }

  @Post('puntos-riesgo/:id/preplan')
  @RequirePermission('servicios:editar')
  guardarPreplan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: GuardarPreplanDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.carto.guardarPreplan(id, dto, this.ctx(user, req));
  }
}
