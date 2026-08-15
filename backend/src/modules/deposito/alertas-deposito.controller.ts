import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { AlertasDepositoService } from './alertas-deposito.service';

@ApiTags('deposito/alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/alertas')
export class AlertasDepositoController {
  constructor(private readonly service: AlertasDepositoService) {}

  @Get()
  @RequirePermission('deposito:ver')
  resumen() {
    return this.service.resumen();
  }
}
