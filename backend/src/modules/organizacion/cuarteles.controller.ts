import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CuartelsService } from './cuarteles.service';
import { CreateCuartelDto } from './dto/create-cuartele.dto';
import { UpdateCuartelDto } from './dto/update-cuartele.dto';

@ApiTags('organizacion/cuarteles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/cuarteles')
export class CuartelsController {
  constructor(private readonly cuartelsService: CuartelsService) {}

  @Get()
  @RequirePermission('organizacion:cuarteles_ver')
  findAll(
    @Query('q') q?: string,
    @Query('estado') estado?: string,
    @Query('incluirEliminados') incluirEliminados?: string,
  ) {
    return this.cuartelsService.findAll(q, estado, incluirEliminados === 'true');
  }

  @Get('exportar/excel')
  @RequirePermission('organizacion:cuarteles_ver')
  async exportarExcel(@Res() res: Response) {
    const filas = await this.cuartelsService.filasExportables();
    await enviarExportacion(res, 'excel', filas, 'cuarteles', 'Cuarteles');
  }

  @Get('exportar/pdf')
  @RequirePermission('organizacion:cuarteles_ver')
  async exportarPdf(@Res() res: Response) {
    const filas = await this.cuartelsService.filasExportables();
    await enviarExportacion(res, 'pdf', filas, 'cuarteles', 'Cuarteles');
  }

  @Get(':id')
  @RequirePermission('organizacion:cuarteles_ver')
  findOne(@Param('id') id: string) {
    return this.cuartelsService.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:cuarteles_crear')
  create(@Body() dto: CreateCuartelDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cuartelsService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('organizacion:cuarteles_editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCuartelDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cuartelsService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('organizacion:cuarteles_eliminar')
  darBaja(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cuartelsService.darBaja(id, user.id);
  }

  @Patch(':id/reactivar')
  @RequirePermission('organizacion:cuarteles_eliminar')
  reactivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cuartelsService.reactivar(id, user.id);
  }
}
