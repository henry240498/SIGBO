import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';

@ApiTags('equipos/equipos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('equipos/equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Get()
  @RequirePermission('equipos:ver')
  findAll(
    @Query('q') q?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.equiposService.findAll(q, categoriaId, estado);
  }

  @Get(':id')
  @RequirePermission('equipos:ver')
  findOne(@Param('id') id: string) {
    return this.equiposService.findOne(id);
  }

  @Post()
  @RequirePermission('equipos:crear')
  create(@Body() dto: CreateEquipoDto) {
    return this.equiposService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('equipos:editar')
  update(@Param('id') id: string, @Body() dto: UpdateEquipoDto) {
    return this.equiposService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('equipos:editar')
  remove(@Param('id') id: string) {
    return this.equiposService.remove(id);
  }
}
