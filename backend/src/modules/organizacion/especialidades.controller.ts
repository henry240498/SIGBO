import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidade.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidade.dto';

@ApiTags('organizacion/especialidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  @Get()
  @RequirePermission('organizacion:especialidades_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.especialidadesService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:especialidades_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.especialidadesService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'especialidades', 'Especialidades');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:especialidades_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.especialidadesService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'especialidades', 'Especialidades');
  }

  @Get(':id')
  @RequirePermission('organizacion:especialidades_ver')
  findOne(@Param('id') id: string) {
    return this.especialidadesService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:especialidades_crear')
  create(@Body() dto: CreateEspecialidadDto, @CurrentUser() user: AuthenticatedUser) {
    return this.especialidadesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:especialidades_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEspecialidadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.especialidadesService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:especialidades_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.especialidadesService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:especialidades_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.especialidadesService.reactivar(id, user.id);
  }
}
