import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { CreateMantenimientoVehiculoDto } from './dto/create-mantenimiento-vehiculo.dto';
import { CreateConsumoCombustibleDto } from './dto/create-consumo-combustible.dto';
import { BajaVehiculoDto } from './dto/baja-vehiculo.dto';

@ApiTags('vehiculos/vehiculos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vehiculos/vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Get()
  @RequirePermission('vehiculos:ver')
  findAll(@Query('estado') estado?: string) {
    return this.vehiculosService.findAll(estado);
  }

  @Get(':id')
  @RequirePermission('vehiculos:ver')
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Post()
  @RequirePermission('vehiculos:crear')
  create(@Body() dto: CreateVehiculoDto) {
    return this.vehiculosService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('vehiculos:editar')
  update(@Param('id') id: string, @Body() dto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, dto);
  }

  @Patch(':id/baja')
  @RequirePermission('vehiculos:eliminar')
  darBaja(@Param('id') id: string, @Body() dto: BajaVehiculoDto) {
    return this.vehiculosService.darBaja(id, dto);
  }

  @Get(':id/historial')
  @RequirePermission('vehiculos:ver')
  historial(@Param('id') id: string) {
    return this.vehiculosService.historial(id);
  }

  @Get(':id/mantenimientos')
  @RequirePermission('vehiculos:mantenimiento')
  listarMantenimientos(@Param('id') id: string) {
    return this.vehiculosService.listarMantenimientos(id);
  }

  @Post(':id/mantenimientos')
  @RequirePermission('vehiculos:mantenimiento')
  crearMantenimiento(
    @Param('id') id: string,
    @Body() dto: CreateMantenimientoVehiculoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiculosService.crearMantenimiento(id, dto, user.id);
  }

  @Get(':id/combustible')
  @RequirePermission('vehiculos:combustible')
  listarCombustible(@Param('id') id: string) {
    return this.vehiculosService.listarCombustible(id);
  }

  @Post(':id/combustible')
  @RequirePermission('vehiculos:combustible')
  crearCombustible(
    @Param('id') id: string,
    @Body() dto: CreateConsumoCombustibleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.vehiculosService.crearCombustible(id, dto, user.id);
  }
}
