import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { DashboardDepositoService } from './dashboard-deposito.service';

@ApiTags('deposito/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/dashboard')
export class DashboardDepositoController {
  constructor(private readonly service: DashboardDepositoService) {}

  @Get()
  @RequirePermission('deposito:ver')
  indicadores() {
    return this.service.indicadores();
  }
}
