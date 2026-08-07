import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

@ApiTags('organizacion/turnos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Get()
  @RequirePermission('organizacion:turnos_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.turnosService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:turnos_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.turnosService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'turnos', 'Turnos');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:turnos_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.turnosService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'turnos', 'Turnos');
  }

  @Get(':id')
  @RequirePermission('organizacion:turnos_ver')
  findOne(@Param('id') id: string) {
    return this.turnosService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:turnos_crear')
  create(@Body() dto: CreateTurnoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.turnosService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:turnos_editar')
  update(@Param('id') id: string, @Body() dto: UpdateTurnoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.turnosService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:turnos_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.turnosService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:turnos_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.turnosService.reactivar(id, user.id);
  }
}
