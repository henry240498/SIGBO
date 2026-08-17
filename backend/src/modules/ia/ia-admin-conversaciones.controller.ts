import { Controller, Delete, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { IaConversacionesService } from './ia-conversaciones.service';

/** Panel exclusivo de Seguridad -> Inteligencia Artificial (seccion 34 del
 * pedido): ver conversaciones ajenas exige `inteligencia:ver_conversaciones`,
 * distinto del permiso basico `inteligencia:usar` que solo da acceso a las
 * propias (seccion 53, privacidad). */
@ApiTags('ia/admin/conversaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia/admin')
export class IaAdminConversacionesController {
  constructor(
    private readonly conversacionesService: IaConversacionesService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  @Get('conversaciones')
  @RequirePermission('inteligencia:ver_conversaciones')
  todas(@Query('usuarioId') usuarioId?: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.conversacionesService.todasLasConversaciones({ usuarioId, desde, hasta });
  }

  @Get('conversaciones/:id/ejecuciones')
  @RequirePermission('inteligencia:ver_conversaciones')
  ejecucionesDe(@Param('id') id: string) {
    return this.conversacionesService.ejecucionesDe(id);
  }

  @Delete('conversaciones/:id')
  @RequirePermission('inteligencia:eliminar_conversaciones')
  async eliminar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    await this.conversacionesService.eliminar(id, user.id, req.ip ?? null);
    return { eliminado: true };
  }

  /** Auditoria administrativa del modulo (seccion 55): cambios de
   * configuracion, activaciones/desactivaciones, decisiones sobre
   * propuestas -- todo lo que ya pasa por AuditoriaService con recurso
   * `ia.*`. Distinto de la auditoria por conversacion (seccion 6-8), que
   * ya vive en ia.mensajes/ia.ejecuciones_herramientas. */
  @Get('auditoria')
  @RequirePermission('inteligencia:ver_auditoria')
  auditoria(@Query('accion') accion?: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.auditoriaService.findAll({
      recursoPrefijo: 'ia.',
      accion,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
      pageSize: 50,
    });
  }
}
