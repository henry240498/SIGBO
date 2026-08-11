import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { DashboardAsistenciaService } from './dashboard-asistencia.service';

@ApiTags('operaciones/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/dashboard')
export class DashboardAsistenciaController {
  constructor(private readonly service: DashboardAsistenciaService) {}

  @Get()
  @RequirePermission('asistencia:asistencia_ver')
  obtenerIndicadores() {
    return this.service.obtenerIndicadores();
  }
}
