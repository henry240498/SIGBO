import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

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
}
