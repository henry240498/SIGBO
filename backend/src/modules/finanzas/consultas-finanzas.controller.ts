import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ConsultasFinanzasService } from './consultas-finanzas.service';

@ApiTags('finanzas/consultas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/consultas')
export class ConsultasFinanzasController {
  constructor(private readonly service: ConsultasFinanzasService) {}

  @Get('saldo-cajas')
  @RequirePermission('finanzas:ver')
  saldoDeCajas() {
    return this.service.saldoDeCajas();
  }

  @Get('gasto-por-categoria/:nombreCategoria')
  @RequirePermission('finanzas:ver')
  gastoPorCategoria(@Param('nombreCategoria') nombreCategoria: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.gastoPorCategoria(nombreCategoria, desde, hasta);
  }

  @Get('ingreso-por-tipo/:nombreTipo')
  @RequirePermission('finanzas:ver')
  ingresoPorTipo(@Param('nombreTipo') nombreTipo: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.ingresoPorTipo(nombreTipo, desde, hasta);
  }

  @Get('ordenes-pendientes')
  @RequirePermission('finanzas:ver')
  ordenesPendientes() {
    return this.service.ordenesPendientes();
  }
}
