import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CategoriasArticuloService } from './categorias-articulo.service';
import { CreateCategoriaArticuloDto, UpdateCategoriaArticuloDto } from './dto/categoria-articulo.dto';

@ApiTags('deposito/categorias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/categorias')
export class CategoriasArticuloController {
  constructor(private readonly service: CategoriasArticuloService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(@Query('q') q?: string, @Query('activo') activo?: string) {
    return this.service.findAll(q, activo);
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('deposito:crear')
  create(@Body() dto: CreateCategoriaArticuloDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('deposito:editar')
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaArticuloDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermission('deposito:eliminar')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.remove(id, user.id, req.ip);
  }
}
