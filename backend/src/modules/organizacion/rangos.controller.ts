import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { RangosService } from './rangos.service';
import { CreateRangoDto } from './dto/create-rango.dto';
import { UpdateRangoDto } from './dto/update-rango.dto';

@ApiTags('organizacion/rangos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/rangos')
export class RangosController {
  constructor(private readonly rangosService: RangosService) {}

  @Get()
  @RequirePermission('organizacion:rangos_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.rangosService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:rangos_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.rangosService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'rangos', 'Rangos');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:rangos_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.rangosService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'rangos', 'Rangos');
  }

  @Get(':id')
  @RequirePermission('organizacion:rangos_ver')
  findOne(@Param('id') id: string) {
    return this.rangosService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:rangos_crear')
  create(@Body() dto: CreateRangoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rangosService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:rangos_editar')
  update(@Param('id') id: string, @Body() dto: UpdateRangoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rangosService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:rangos_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rangosService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:rangos_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rangosService.reactivar(id, user.id);
  }
}
