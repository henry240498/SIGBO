import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { IntegracionDepositoService } from './integracion-deposito.service';

@ApiTags('deposito/integracion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito')
export class IntegracionDepositoController {
  constructor(private readonly service: IntegracionDepositoService) {}

  @Get('equipos/:equipoId/ubicacion')
  @RequirePermission('deposito:ver')
  ubicacionDeEquipo(@Param('equipoId') equipoId: string) {
    return this.service.ubicacionDeEquipo(equipoId);
  }

  @Get('vehiculos/:vehiculoId/equipamiento')
  @RequirePermission('deposito:ver')
  equipamientoDeVehiculo(@Param('vehiculoId') vehiculoId: string) {
    return this.service.equipamientoDeVehiculo(vehiculoId);
  }

  @Get('personal/:bomberoId/equipamiento')
  @RequirePermission('deposito:ver')
  equipamientoDeBombero(@Param('bomberoId') bomberoId: string) {
    return this.service.equipamientoDeBombero(bomberoId);
  }
}
