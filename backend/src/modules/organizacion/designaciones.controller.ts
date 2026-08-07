import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { DesignacionesService } from './designaciones.service';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { FinalizarDesignacionDto } from './dto/finalizar-designacion.dto';

@ApiTags('organizacion/designaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/designaciones')
export class DesignacionesController {
  constructor(private readonly service: DesignacionesService) {}

  @Get()
  @RequirePermission('organizacion:designaciones_ver')
  findAll(
    @Query('bomberoId') bomberoId?: string,
    @Query('cargoId') cargoId?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.service.findAll({ bomberoId, cargoId, estado, incluirEliminados: incluirEliminados === 'true' });
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:designaciones_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.service.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'designaciones', 'Designaciones');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:designaciones_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.service.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'designaciones', 'Designaciones');
  }

  @Get(':id')
  @RequirePermission('organizacion:designaciones_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:designaciones_crear')
  create(@Body() dto: CreateDesignacionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:designaciones_editar')
  update(@Param('id') id: string, @Body() dto: UpdateDesignacionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.update(id, dto, user.id);
  }

  @Patch(':id/finalizar')
  @RequirePermission('organizacion:designaciones_finalizar')
  finalizar(
    @Param('id') id: string,
    @Body() dto: FinalizarDesignacionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.finalizar(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:designaciones_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:designaciones_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.reactivar(id, user.id);
  }
}
