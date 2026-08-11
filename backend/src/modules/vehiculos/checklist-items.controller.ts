import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ChecklistItemsService } from './checklist-items.service';
import { CreateChecklistItemVehiculoDto, UpdateChecklistItemVehiculoDto } from './dto/checklist-item-vehiculo.dto';

@ApiTags('vehiculos/checklist-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('vehiculos/checklist-items')
export class ChecklistItemsController {
  constructor(private readonly service: ChecklistItemsService) {}

  @Get()
  @RequirePermission('vehiculos:ver')
  findAll(@Query('tipoVehiculo') tipoVehiculo?: string, @Query('soloActivos') soloActivos?: string) {
    return this.service.findAll(tipoVehiculo, soloActivos === 'true');
  }

  @Post()
  @RequirePermission('vehiculos:editar')
  create(@Body() dto: CreateChecklistItemVehiculoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission('vehiculos:editar')
  update(@Param('id') id: string, @Body() dto: UpdateChecklistItemVehiculoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('vehiculos:editar')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
