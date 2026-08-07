import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CategoriasEquipoService } from './categorias-equipo.service';
import { CreateCategoriaEquipoDto } from './dto/create-categoria-equipo.dto';
import { UpdateCategoriaEquipoDto } from './dto/update-categoria-equipo.dto';

@ApiTags('equipos/categorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('equipos/categorias')
export class CategoriasEquipoController {
  constructor(private readonly categoriasService: CategoriasEquipoService) {}

  @Get()
  @RequirePermission('equipos:ver')
  findAll(@Query('q') q?: string, @Query('activo') activo?: string) {
    return this.categoriasService.findAll(q, activo);
  }

  @Get(':id')
  @RequirePermission('equipos:ver')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @RequirePermission('equipos:crear')
  create(@Body() dto: CreateCategoriaEquipoDto) {
    return this.categoriasService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('equipos:editar')
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaEquipoDto) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('equipos:editar')
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }
}
