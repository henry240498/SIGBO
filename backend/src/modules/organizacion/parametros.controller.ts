import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ParametrosService } from './parametros.service';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';

@ApiTags('organizacion/parametros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Get()
  @RequirePermission('organizacion:parametros_ver')
  findAll(
    @Query('tipo') tipo?: string,
    @Query('padreId') padreId?: string,
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.parametrosService.findAll(tipo, padreId, q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:parametros_ver')
  async exportarExcel(@Query('tipo') tipo: string | undefined, @Res() res: Response) {
    const filas = await this.parametrosService.filasExportables(tipo);
    await enviarExportacion(res, 'excel', filas, 'parametros', 'Parametros institucionales');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:parametros_ver')
  async exportarPdf(@Query('tipo') tipo: string | undefined, @Res() res: Response) {
    const filas = await this.parametrosService.filasExportables(tipo);
    await enviarExportacion(res, 'pdf', filas, 'parametros', 'Parametros institucionales');
  }

  @Get(':id')
  @RequirePermission('organizacion:parametros_ver')
  findOne(@Param('id') id: string) {
    return this.parametrosService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:parametros_crear')
  create(@Body() dto: CreateParametroDto, @CurrentUser() user: AuthenticatedUser) {
    return this.parametrosService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:parametros_editar')
  update(@Param('id') id: string, @Body() dto: UpdateParametroDto, @CurrentUser() user: AuthenticatedUser) {
    return this.parametrosService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:parametros_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.parametrosService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:parametros_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.parametrosService.reactivar(id, user.id);
  }
}
