import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { BrigadasService } from './brigadas.service';
import { CreateBrigadaDto } from './dto/create-brigada.dto';
import { UpdateBrigadaDto } from './dto/update-brigada.dto';

@ApiTags('organizacion/brigadas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/brigadas')
export class BrigadasController {
  constructor(private readonly brigadasService: BrigadasService) {}

  @Get()
  @RequirePermission('organizacion:brigadas_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.brigadasService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:brigadas_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.brigadasService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'brigadas', 'Brigadas');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:brigadas_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.brigadasService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'brigadas', 'Brigadas');
  }

  @Get(':id')
  @RequirePermission('organizacion:brigadas_ver')
  findOne(@Param('id') id: string) {
    return this.brigadasService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:brigadas_crear')
  create(@Body() dto: CreateBrigadaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.brigadasService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:brigadas_editar')
  update(@Param('id') id: string, @Body() dto: UpdateBrigadaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.brigadasService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:brigadas_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.brigadasService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:brigadas_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.brigadasService.reactivar(id, user.id);
  }
}
