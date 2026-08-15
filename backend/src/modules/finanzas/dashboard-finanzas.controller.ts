import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { DashboardFinanzasService } from './dashboard-finanzas.service';

@ApiTags('finanzas/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/dashboard')
export class DashboardFinanzasController {
  constructor(private readonly service: DashboardFinanzasService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  indicadores() {
    return this.service.indicadores();
  }
}
