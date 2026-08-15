import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { InventariosFisicosService } from './inventarios-fisicos.service';
import { CreateInventarioFisicoDto, AgregarItemInventarioFisicoDto } from './dto/inventario-fisico.dto';

@ApiTags('deposito/inventarios-fisicos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/inventarios-fisicos')
export class InventariosFisicosController {
  constructor(private readonly service: InventariosFisicosService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(@Query('estado') estado?: string, @Query('ubicacionId') ubicacionId?: string) {
    return this.service.findAll({ estado, ubicacionId });
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/items')
  @RequirePermission('deposito:ver')
  items(@Param('id') id: string) {
    return this.service.items(id);
  }

  @Post()
  @RequirePermission('deposito:inventario_fisico')
  create(@Body() dto: CreateInventarioFisicoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id);
  }

  @Post(':id/items')
  @RequirePermission('deposito:inventario_fisico')
  agregarItem(@Param('id') id: string, @Body() dto: AgregarItemInventarioFisicoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.agregarItem(id, dto, user.id);
  }

  @Patch(':id/finalizar')
  @RequirePermission('deposito:inventario_fisico')
  finalizar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.finalizar(id, user.id, req.ip);
  }
}
