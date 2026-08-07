import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AscensosService } from './ascensos.service';
import { CreateAscensoDto } from './dto/create-ascenso.dto';

@ApiTags('organizacion/ascensos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/ascensos')
export class AscensosController {
  constructor(private readonly service: AscensosService) {}

  @Get()
  @RequirePermission('organizacion:ascensos_ver')
  findAll(@Query('bomberoId') bomberoId?: string, @Query('incluirEliminados') incluirEliminados?: string) {
    return this.service.findAll({ bomberoId, incluirEliminados: incluirEliminados === 'true' });
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:ascensos_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.service.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'ascensos', 'Ascensos');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:ascensos_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.service.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'ascensos', 'Ascensos');
  }

  @Get(':id')
  @RequirePermission('organizacion:ascensos_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:ascensos_crear')
  create(@Body() dto: CreateAscensoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id/anular')
  @RequirePermission('organizacion:ascensos_anular')
  anular(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.anular(id, user.id);
  }
}
