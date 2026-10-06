import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import type { ResultadoInspeccion } from '../../shared/entities';
import { RegistrarInspeccionDto } from './dto/prevencion.dto';
import { PrevencionService } from './prevencion.service';

/** Inspecciones de prevencion y certificados (4.5). Reutiliza servicios:ver / crear. */
@ApiTags('prevencion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('prevencion')
export class PrevencionController {
  constructor(private readonly prevencion: PrevencionService) {}

  @Get('inspecciones')
  @RequirePermission('servicios:ver')
  listar(@Query('resultado') resultado?: string, @Query('limite') limite?: string) {
    const valido = ['APROBADO', 'CON_OBSERVACIONES', 'RECHAZADO'].includes(resultado ?? '') ? (resultado as ResultadoInspeccion) : undefined;
    return this.prevencion.listar({ resultado: valido, limite: limite ? Number(limite) : undefined });
  }

  @Get('estado')
  @RequirePermission('servicios:ver')
  estado(@Query('dias') dias?: string) {
    const n = Number(dias);
    return this.prevencion.estadoActual(Number.isFinite(n) && n >= 0 ? Math.min(n, 365) : 30);
  }

  @Post('inspecciones')
  @RequirePermission('servicios:crear')
  registrar(@Body() dto: RegistrarInspeccionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.prevencion.registrar(dto, { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] });
  }
}
