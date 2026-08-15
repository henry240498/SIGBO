import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MovimientosBancariosService } from './movimientos-bancarios.service';
import { ConciliarMovimientoBancarioDto, CreateMovimientoBancarioDto } from './dto/movimiento-bancario.dto';

@ApiTags('finanzas/movimientos-bancarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/movimientos-bancarios')
export class MovimientosBancariosController {
  constructor(private readonly service: MovimientosBancariosService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll(
    @Query('cuentaBancariaId') cuentaBancariaId?: string,
    @Query('estadoConciliacion') estadoConciliacion?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ cuentaBancariaId, estadoConciliacion, desde, hasta });
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('finanzas:crear')
  create(@Body() dto: CreateMovimientoBancarioDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Post(':id/conciliar')
  @RequirePermission('finanzas:conciliar')
  conciliar(@Param('id') id: string, @Body() dto: ConciliarMovimientoBancarioDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.conciliar(id, dto, user.id, req.ip);
  }
}
