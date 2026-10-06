import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import {
  ActualizarInstalacionDto,
  CancelarReservaDto,
  CrearInstalacionDto,
  DecidirReservaDto,
  SolicitarReservaDto,
} from './dto/reservas.dto';
import { ReservasService } from './reservas.service';

/** Reservas de instalaciones del cuartel (4.4). */
@ApiTags('reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservas: ReservasService) {}

  private ctx(user: AuthenticatedUser, req: Request) {
    return {
      usuarioId: user.id,
      puedeDecidir: user.permisos.includes('reservas:decidir'),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Get('instalaciones')
  @RequirePermission('reservas:ver')
  instalaciones(@Query('inactivas') inactivas?: string) {
    return this.reservas.listarInstalaciones(inactivas === 'true');
  }

  @Post('instalaciones')
  @RequirePermission('reservas:decidir')
  crearInstalacion(@Body() dto: CrearInstalacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.reservas.crearInstalacion(dto, this.ctx(user, req));
  }

  @Patch('instalaciones/:id')
  @RequirePermission('reservas:decidir')
  actualizarInstalacion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarInstalacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reservas.actualizarInstalacion(id, dto, this.ctx(user, req));
  }

  @Get()
  @RequirePermission('reservas:ver')
  listar(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('estado') estado?: string,
    @Query('instalacionId') instalacionId?: string,
  ) {
    const validos = ['SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'];
    return this.reservas.listar({ desde, hasta, estado: validos.includes(estado ?? '') ? estado : undefined, instalacionId });
  }

  @Post()
  @RequirePermission('reservas:solicitar')
  solicitar(@Body() dto: SolicitarReservaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.reservas.solicitar(dto, this.ctx(user, req));
  }

  @Patch(':id/decision')
  @RequirePermission('reservas:decidir')
  decidir(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: DecidirReservaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reservas.decidir(id, dto, this.ctx(user, req));
  }

  @Patch(':id/cancelar')
  @RequirePermission('reservas:solicitar')
  cancelar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CancelarReservaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reservas.cancelar(id, dto, this.ctx(user, req));
  }
}
