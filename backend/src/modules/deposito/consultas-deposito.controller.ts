import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ConsultasDepositoService } from './consultas-deposito.service';

@ApiTags('deposito/consultas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/consultas')
export class ConsultasDepositoController {
  constructor(private readonly service: ConsultasDepositoService) {}

  @Get('disponibles-por-categoria/:categoriaEquipoId')
  @RequirePermission('deposito:ver')
  disponiblesPorCategoria(@Param('categoriaEquipoId') categoriaEquipoId: string) {
    return this.service.disponiblesPorCategoria(categoriaEquipoId);
  }

  @Get('quien-tiene/:equipoId')
  @RequirePermission('deposito:ver')
  quienTiene(@Param('equipoId') equipoId: string) {
    return this.service.quienTiene(equipoId);
  }

  @Get('vencidos')
  @RequirePermission('deposito:ver')
  vencidos() {
    return this.service.vencidos();
  }

  @Get('vehiculo/:vehiculoId/estado/:nombreEstado')
  @RequirePermission('deposito:ver')
  porVehiculoYEstado(@Param('vehiculoId') vehiculoId: string, @Param('nombreEstado') nombreEstado: string) {
    return this.service.porVehiculoYEstado(vehiculoId, nombreEstado);
  }
}
