import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SesionesService } from './sesiones.service';
import { AuditoriaService } from './auditoria.service';

@ApiTags('seguridad/sesiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('seguridad/sesiones')
export class SesionesController {
  constructor(
    private readonly sesionesService: SesionesService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  @Get()
  @RequirePermission('seguridad:ver_usuarios')
  findActivas() {
    return this.sesionesService.findActivas();
  }

  @Delete(':id')
  @RequirePermission('seguridad:cerrar_sesion')
  async cerrar(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const sesion = await this.sesionesService.cerrar(id);
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      accion: 'CERRAR_SESION_REMOTA',
      recurso: 'sesion',
      recursoId: id,
      datosDespues: { usuarioAfectado: sesion.usuarioId },
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    return { ok: true };
  }
}
