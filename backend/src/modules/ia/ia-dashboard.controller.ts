import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { IaDashboardService } from './ia-dashboard.service';

@ApiTags('ia/admin/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia/admin/dashboard')
export class IaDashboardController {
  constructor(private readonly service: IaDashboardService) {}

  @Get()
  @RequirePermission('inteligencia:ver_dashboard')
  indicadores() {
    return this.service.indicadores();
  }

  @Get('uso-por-herramienta')
  @RequirePermission('inteligencia:exportar_reportes')
  usoPorHerramienta(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.usoPorHerramienta(desde, hasta);
  }
}
