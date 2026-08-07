import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto } from './dto/create-unidade.dto';
import { UpdateUnidadDto } from './dto/update-unidade.dto';

@ApiTags('organizacion/unidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Get()
  @RequirePermission('organizacion:unidades_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.unidadesService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:unidades_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.unidadesService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'unidades', 'Unidades');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:unidades_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.unidadesService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'unidades', 'Unidades');
  }

  @Get(':id')
  @RequirePermission('organizacion:unidades_ver')
  findOne(@Param('id') id: string) {
    return this.unidadesService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:unidades_crear')
  create(@Body() dto: CreateUnidadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.unidadesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:unidades_editar')
  update(@Param('id') id: string, @Body() dto: UpdateUnidadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.unidadesService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:unidades_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.unidadesService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:unidades_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.unidadesService.reactivar(id, user.id);
  }
}
