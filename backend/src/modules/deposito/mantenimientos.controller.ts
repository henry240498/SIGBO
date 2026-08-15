import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MantenimientosService } from './mantenimientos.service';
import { CreateMantenimientoDepositoDto, FinalizarMantenimientoDto } from './dto/mantenimiento-deposito.dto';

@ApiTags('deposito/mantenimientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/mantenimientos')
export class MantenimientosController {
  constructor(private readonly service: MantenimientosService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(@Query('estado') estado?: string, @Query('equipoId') equipoId?: string, @Query('articuloId') articuloId?: string) {
    return this.service.findAll({ estado, equipoId, articuloId });
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('deposito:mantenimiento')
  create(@Body() dto: CreateMantenimientoDepositoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id/finalizar')
  @RequirePermission('deposito:mantenimiento')
  finalizar(@Param('id') id: string, @Body() dto: FinalizarMantenimientoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.finalizar(id, dto, user.id, req.ip);
  }
}
