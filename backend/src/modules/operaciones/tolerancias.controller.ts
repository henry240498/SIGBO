import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ToleranciasService } from './tolerancias.service';
import { ToleranciaAsistenciaDto } from './dto/tolerancia-asistencia.dto';

@ApiTags('operaciones/tolerancias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/tolerancias')
export class ToleranciasController {
  constructor(private readonly service: ToleranciasService) {}

  @Get()
  @RequirePermission('asistencia:asistencia_ver')
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermission('asistencia:asistencia_editar')
  create(@Body() dto: ToleranciaAsistenciaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission('asistencia:asistencia_editar')
  update(@Param('id') id: string, @Body() dto: Partial<ToleranciaAsistenciaDto>) {
    return this.service.update(id, dto);
  }
}
