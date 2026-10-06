import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CrearReporteDto } from './dto/reporte.dto';
import { ReportesService } from './reportes.service';

/** Errores y sugerencias sobre la app o el sistema, guardados como texto plano en el servidor. */
@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Post()
  @RequirePermission('reportes:enviar')
  crear(@Body() dto: CrearReporteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.reportes.crear(dto, { usuarioId: user.id, username: user.username, ip: req.ip, userAgent: req.headers['user-agent'] });
  }
}
