import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@ApiTags('organizacion/cargos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  @RequirePermission('organizacion:cargos_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.cargosService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:cargos_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.cargosService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'cargos', 'Cargos');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:cargos_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.cargosService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'cargos', 'Cargos');
  }

  @Get(':id')
  @RequirePermission('organizacion:cargos_ver')
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:cargos_crear')
  create(@Body() dto: CreateCargoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cargosService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:cargos_editar')
  update(@Param('id') id: string, @Body() dto: UpdateCargoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cargosService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:cargos_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cargosService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:cargos_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cargosService.reactivar(id, user.id);
  }
}
