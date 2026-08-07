import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { TiposGuardiaService } from './tipos-guardia.service';
import { CreateTipoGuardiaDto } from './dto/create-tipo-guardia.dto';
import { UpdateTipoGuardiaDto } from './dto/update-tipo-guardia.dto';

@ApiTags('organizacion/tipos-guardia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/tipos-guardia')
export class TiposGuardiaController {
  constructor(private readonly tiposGuardiaService: TiposGuardiaService) {}

  @Get()
  @RequirePermission('organizacion:tipos_guardia_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.tiposGuardiaService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:tipos_guardia_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.tiposGuardiaService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'tipos-guardia', 'Tipos de Guardia');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:tipos_guardia_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.tiposGuardiaService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'tipos-guardia', 'Tipos de Guardia');
  }

  @Get(':id')
  @RequirePermission('organizacion:tipos_guardia_ver')
  findOne(@Param('id') id: string) {
    return this.tiposGuardiaService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:tipos_guardia_crear')
  create(@Body() dto: CreateTipoGuardiaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposGuardiaService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:tipos_guardia_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTipoGuardiaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tiposGuardiaService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:tipos_guardia_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposGuardiaService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:tipos_guardia_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposGuardiaService.reactivar(id, user.id);
  }
}
