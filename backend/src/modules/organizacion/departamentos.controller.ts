import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@ApiTags('organizacion/departamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Get()
  @RequirePermission('organizacion:departamentos_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.departamentosService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:departamentos_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.departamentosService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'departamentos', 'Departamentos');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:departamentos_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.departamentosService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'departamentos', 'Departamentos');
  }

  @Get(':id')
  @RequirePermission('organizacion:departamentos_ver')
  findOne(@Param('id') id: string) {
    return this.departamentosService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:departamentos_crear')
  create(@Body() dto: CreateDepartamentoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.departamentosService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:departamentos_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartamentoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.departamentosService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:departamentos_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.departamentosService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:departamentos_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.departamentosService.reactivar(id, user.id);
  }
}
