import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { AnularMovimientoFinancieroDto, RegistrarMovimientoFinancieroDto } from './dto/movimiento-financiero.dto';

@ApiTags('finanzas/movimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/movimientos')
export class MovimientosFinancierosController {
  constructor(private readonly service: MovimientosFinancierosService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll(
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('cajaId') cajaId?: string,
    @Query('cuentaBancariaId') cuentaBancariaId?: string,
    @Query('proveedorId') proveedorId?: string,
    @Query('bomberoId') bomberoId?: string,
    @Query('tipoIngresoId') tipoIngresoId?: string,
    @Query('categoriaEgresoId') categoriaEgresoId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ tipo, estado, cajaId, cuentaBancariaId, proveedorId, bomberoId, tipoIngresoId, categoriaEgresoId, desde, hasta });
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/documento')
  @RequirePermission('finanzas:ver')
  documento(@Param('id') id: string) {
    return this.service.documentoDe(id);
  }

  @Post()
  @RequirePermission('finanzas:crear')
  registrar(@Body() dto: RegistrarMovimientoFinancieroDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.registrar(dto, user.id, req.ip);
  }

  @Post(':id/anular')
  @RequirePermission('finanzas:anular')
  anular(@Param('id') id: string, @Body() dto: AnularMovimientoFinancieroDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }
}
