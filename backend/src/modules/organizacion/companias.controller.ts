import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CompaniasService } from './companias.service';
import { CreateCompaniaDto } from './dto/create-compania.dto';
import { UpdateCompaniaDto } from './dto/update-compania.dto';

@ApiTags('organizacion/companias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/companias')
export class CompaniasController {
  constructor(private readonly companiasService: CompaniasService) {}

  @Get()
  @RequirePermission('organizacion:companias_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.companiasService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:companias_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.companiasService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'companias', 'Companias');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:companias_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.companiasService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'companias', 'Companias');
  }

  @Get(':id')
  @RequirePermission('organizacion:companias_ver')
  findOne(@Param('id') id: string) {
    return this.companiasService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:companias_crear')
  create(@Body() dto: CreateCompaniaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.companiasService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:companias_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompaniaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.companiasService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:companias_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.companiasService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:companias_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.companiasService.reactivar(id, user.id);
  }
}
