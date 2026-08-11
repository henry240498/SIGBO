import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { TiposBomberoService } from './tipos-bombero.service';
import { CreateTipoBomberoDto } from './dto/create-tipo-bombero.dto';
import { UpdateTipoBomberoDto } from './dto/update-tipo-bombero.dto';

@ApiTags('personal/tipos-bombero')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/tipos-bombero')
export class TiposBomberoController {
  constructor(private readonly tiposBomberoService: TiposBomberoService) {}

  @Get()
  @RequirePermission('personal:tipos_bombero_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.tiposBomberoService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('personal:tipos_bombero_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.tiposBomberoService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'tipos-bombero', 'Tipos de Bombero');
  }

  @Get('exportar/pdf')
  @RequirePermission('personal:tipos_bombero_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.tiposBomberoService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'tipos-bombero', 'Tipos de Bombero');
  }

  @Get(':id')
  @RequirePermission('personal:tipos_bombero_ver')
  findOne(@Param('id') id: string) {
    return this.tiposBomberoService.findOne(id);
  }

  @Post()
  @RequirePermission('personal:tipos_bombero_crear')
  create(@Body() dto: CreateTipoBomberoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposBomberoService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('personal:tipos_bombero_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTipoBomberoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tiposBomberoService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('personal:tipos_bombero_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposBomberoService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('personal:tipos_bombero_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tiposBomberoService.reactivar(id, user.id);
  }
}
