import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { ContextoSistema, RespaldosService } from './respaldos.service';
import { SistemaService } from './sistema.service';

/** Area Sistema del Centro de mando (spec 2026-10-09 §6). */
@ApiTags('sistema')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sistema')
export class SistemaController {
  constructor(private readonly sistema: SistemaService, private readonly respaldos: RespaldosService) {}

  private ctx(user: AuthenticatedUser, req: Request): ContextoSistema {
    return { usuarioId: user.id, ip: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
  }

  @Get('resumen')
  @RequirePermission('sistema:ver')
  resumen() { return this.sistema.resumen(); }

  @Get('estado')
  @RequirePermission('sistema:ver')
  estado() { return this.sistema.estado(); }

  @Get('tareas')
  @RequirePermission('sistema:ver')
  tareas() { return this.sistema.tareasYTrabajos(); }

  @Post('tareas/avisos-vencimiento/ejecutar')
  @RequirePermission('sistema:operar')
  ejecutarAvisos(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) { return this.sistema.ejecutarAvisos(this.ctx(user, req)); }

  @Get('respaldos')
  @RequirePermission('sistema:ver')
  listarRespaldos() { return this.respaldos.respaldos(); }

  @Post('respaldos/ejecutar')
  @RequirePermission('sistema:operar')
  respaldar(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) { return this.respaldos.respaldarAhora(this.ctx(user, req)); }

  @Post('respaldos/:archivo/verificar')
  @RequirePermission('sistema:operar')
  verificar(@Param('archivo') archivo: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.respaldos.verificarRespaldo(archivo, this.ctx(user, req));
  }

  @Get('migraciones')
  @RequirePermission('sistema:ver')
  migraciones() { return this.respaldos.migraciones(); }

  @Get('app-movil')
  @RequirePermission('sistema:ver')
  appMovil() { return this.sistema.appMovil(); }

  @Get('conexion-movil')
  @RequirePermission('sistema:ver')
  conexionMovil() { return this.sistema.conexionMovil(); }

  @Get('registros')
  @RequirePermission('sistema:ver_registros')
  registros(@Query('archivo') archivo: string, @Query('lineas') lineas: string | undefined, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.sistema.registros(archivo ?? '', Number(lineas) || 200, this.ctx(user, req));
  }
}
