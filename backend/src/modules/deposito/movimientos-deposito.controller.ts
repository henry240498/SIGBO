import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MovimientosDepositoService } from './movimientos-deposito.service';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';

@ApiTags('deposito/movimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/movimientos')
export class MovimientosDepositoController {
  constructor(private readonly service: MovimientosDepositoService) {}

  @Get()
  @RequirePermission('deposito:ver')
  listar(
    @Query('tipoElemento') tipoElemento?: string,
    @Query('equipoId') equipoId?: string,
    @Query('articuloId') articuloId?: string,
    @Query('tipoMovimientoId') tipoMovimientoId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.listar({ tipoElemento, equipoId, articuloId, tipoMovimientoId, desde, hasta });
  }

  @Post()
  @RequirePermission('deposito:movimiento')
  registrar(@Body() dto: RegistrarMovimientoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.registrarManual(dto, user.id, req.ip);
  }

  @Get('tenencia-equipo/:equipoId')
  @RequirePermission('deposito:ver')
  tenenciaDeEquipo(@Param('equipoId') equipoId: string) {
    return this.service.tenenciaDeEquipo(equipoId);
  }
}
