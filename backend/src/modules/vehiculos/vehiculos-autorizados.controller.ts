import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { VehiculosAutorizadosService } from './vehiculos-autorizados.service';
import { SetVehiculosAutorizadosDto } from './dto/vehiculo-autorizado.dto';

@ApiTags('personal/bomberos/vehiculos-autorizados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class VehiculosAutorizadosController {
  constructor(private readonly service: VehiculosAutorizadosService) {}

  @Get(':id/vehiculos-autorizados')
  @RequirePermission('personal:ver')
  listar(@Param('id') id: string) {
    return this.service.listar(id);
  }

  @Put(':id/vehiculos-autorizados')
  @RequirePermission('personal:editar')
  reemplazar(@Param('id') id: string, @Body() dto: SetVehiculosAutorizadosDto) {
    return this.service.reemplazar(id, dto.vehiculos);
  }
}
