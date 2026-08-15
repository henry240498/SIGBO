import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { DashboardDocumentosService } from './dashboard-documentos.service';

@ApiTags('documentos/dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos/dashboard')
export class DashboardDocumentosController {
  constructor(private readonly service: DashboardDocumentosService) {}

  @Get()
  @RequirePermission('documentos:ver')
  indicadores() {
    return this.service.indicadores();
  }
}
