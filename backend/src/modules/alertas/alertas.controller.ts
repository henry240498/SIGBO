import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { AlertasService } from './alertas.service';
import { CambiarEstadoAlertaDto, CrearAlertaDto, ListarAlertasDto } from './dto/alertas.dto';

/**
 * Alertas inmediatas de bomberos (apoyo / chofer) para la app movil.
 *
 * Reutiliza el login JWT existente (cabecera `Authorization: Bearer`, ya
 * aceptada por `extraerAccessToken`) y los permisos de Servicios, sin crear
 * un esquema de autorizacion paralelo. Prefijo global: /api/v1.
 */
@ApiTags('alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  /**
   * Stream en tiempo real (Server-Sent Events) para la red local.
   * El movil lo consume con reintento automatico; el polling de
   * GET /alertas?estado=PENDIENTE queda como respaldo y para FCM futuro.
   */
  @Sse('stream')
  @RequirePermission('servicios:ver')
  stream(): Observable<{ data: unknown }> {
    return this.alertasService.observarEventos().pipe(
      map((alerta) => ({
        data: {
          id: alerta.id,
          tipo: alerta.tipo,
          estado: alerta.estado,
          solicitanteNombre: alerta.solicitanteNombre,
          creadoEn: alerta.creadoEn,
        },
      })),
    );
  }

  @Get()
  @RequirePermission('servicios:ver')
  listar(@Query() filtros: ListarAlertasDto) {
    const limite = filtros.limite ? Number(filtros.limite) : 50;
    return this.alertasService.listar({
      estado: filtros.estado,
      solicitanteId: filtros.solicitanteId,
      limite: Number.isFinite(limite) ? limite : 50,
    });
  }

  @Get(':id')
  @RequirePermission('servicios:ver')
  obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.alertasService.obtener(id);
  }

  @Post()
  @RequirePermission('servicios:crear')
  crear(
    @Body() dto: CrearAlertaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.alertasService.crear(
      dto,
      { id: user.id, username: user.username },
      { ip: req.ip, userAgent: req.headers['user-agent'] },
    );
  }

  @Patch(':id/estado')
  @RequirePermission('servicios:editar')
  cambiarEstado(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CambiarEstadoAlertaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.alertasService.cambiarEstado(
      id,
      dto,
      { id: user.id, username: user.username },
      { ip: req.ip, userAgent: req.headers['user-agent'] },
    );
  }
}
