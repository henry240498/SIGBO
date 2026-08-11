import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CambiarEstadoComunicacionDto } from './dto/cambiar-estado-comunicacion.dto';
import { GuardarComunicacionDto } from './dto/guardar-comunicacion.dto';
import { ServiciosService } from './servicios.service';

@ApiTags('servicios/comunicaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('servicios/comunicaciones')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  @RequirePermission('servicios:ver')
  listar() { return this.serviciosService.listar(); }

  @Get('catalogos')
  @RequirePermission('servicios:ver')
  catalogos(@Query('q') q?: string) { return this.serviciosService.catalogos(q); }

  @Get(':id/exportar/pdf')
  @ApiProduces('application/pdf')
  @RequirePermission('servicios:exportar_informe')
  async exportarPdf(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const archivo = await this.serviciosService.generarPdf(id, user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${archivo.nombreArchivo}"`,
    });
    res.send(archivo.buffer);
  }

  @Get(':id')
  @RequirePermission('servicios:ver')
  obtener(@Param('id', new ParseUUIDPipe()) id: string) { return this.serviciosService.obtener(id); }

  @Post()
  @RequirePermission('servicios:crear')
  crear(@Body() dto: GuardarComunicacionDto, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.crear(dto, user.id); }

  @Patch(':id')
  @RequirePermission('servicios:editar')
  actualizar(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: GuardarComunicacionDto, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.actualizar(id, dto, user.id); }

  @Post(':id/finalizar')
  @RequirePermission('servicios:finalizar')
  finalizar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.finalizar(id, user.id); }

  @Post(':id/enviar-revision')
  @RequirePermission('servicios:editar')
  enviarRevision(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CambiarEstadoComunicacionDto, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.enviarRevision(id, dto, user.id); }

  @Post(':id/observar')
  @RequirePermission('servicios:editar')
  observar(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CambiarEstadoComunicacionDto, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.observar(id, dto, user.id); }

  @Post(':id/reabrir')
  @RequirePermission('servicios:editar')
  reabrir(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CambiarEstadoComunicacionDto, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.reabrir(id, dto, user.id); }

  @Post(':id/anular')
  @RequirePermission('servicios:eliminar')
  anular(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CambiarEstadoComunicacionDto, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.anular(id, dto, user.id); }

  @Delete(':id')
  @RequirePermission('servicios:eliminar')
  eliminar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) { return this.serviciosService.eliminar(id, user.id); }
}
