import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { EsquemasHorarioService } from './esquemas-horario.service';
import { CreateEsquemaHorarioDto } from './dto/create-esquema-horario.dto';
import { UpdateEsquemaHorarioDto } from './dto/update-esquema-horario.dto';

@ApiTags('guardias/esquemas-horario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/esquemas-horario')
export class EsquemasHorarioController {
  constructor(private readonly service: EsquemasHorarioService) {}

  @Get()
  @RequirePermission('guardias:ver')
  findAll(@Query('soloActivos') soloActivos?: string) {
    return this.service.findAll(soloActivos === 'true');
  }

  @Get(':id')
  @RequirePermission('guardias:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('guardias:requisitos')
  create(@Body() dto: CreateEsquemaHorarioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission('guardias:requisitos')
  update(@Param('id') id: string, @Body() dto: UpdateEsquemaHorarioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('guardias:requisitos')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
