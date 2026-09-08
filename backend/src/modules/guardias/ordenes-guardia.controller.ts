import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OrdenesGuardiaService } from './ordenes-guardia.service';
import { OrdenGuardiaConfiguracionService } from './orden-guardia-configuracion.service';
import { CreateOrdenGuardiaDto } from './dto/create-orden-guardia.dto';
import { ActualizarConfiguracionOrdenDto } from './dto/actualizar-configuracion-orden.dto';
import { AnularOrdenGuardiaDto, RegistrarModificacionOrdenDto } from './dto/anular-orden-guardia.dto';

/** Las rutas literales preceden a :id y el módulo registra este controlador
 * antes del recurso raíz de Guardias; ParseUUIDPipe valida cada id. */

@ApiTags('guardias/ordenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/ordenes')
export class OrdenesGuardiaController {
  constructor(
    private readonly service: OrdenesGuardiaService,
    private readonly configuracionService: OrdenGuardiaConfiguracionService,
  ) {}

  @Get()
  @RequirePermission('guardias:ordenes_ver')
  findAll(@Query('anio') anio?: string, @Query('mes') mes?: string, @Query('estado') estado?: string) {
    return this.service.findAll(anio ? Number(anio) : undefined, mes ? Number(mes) : undefined, estado);
  }

  @Get('configuracion')
  @RequirePermission('guardias:ordenes_ver')
  obtenerConfiguracion() {
    return this.configuracionService.obtener();
  }

  @Put('configuracion')
  @RequirePermission('guardias:ordenes_configurar')
  actualizarConfiguracion(@Body() dto: ActualizarConfiguracionOrdenDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configuracionService.actualizar(dto, user.id);
  }

  @Post()
  @RequirePermission('guardias:ordenes_crear')
  crear(@Body() dto: CreateOrdenGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.crear(dto, user.id, req.ip);
  }

  @Get(':id')
  @RequirePermission('guardias:ordenes_ver')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/archivos/:formato')
  @RequirePermission('guardias:ordenes_ver')
  async descargarArchivo(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('formato') formato: string,
    @Res() res: Response,
  ) {
    if (formato !== 'pdf' && formato !== 'docx') throw new BadRequestException('Formato de archivo no válido');
    const buffer = await this.service.descargarArchivo(id, formato);
    res.set({
      'Content-Type': formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `attachment; filename="orden-guardia-${id}.${formato}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(buffer);
  }

  @Post(':id/regenerar-preview')
  @RequirePermission('guardias:ordenes_editar')
  regenerarPreview(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.regenerarPreview(id, user.id, req.ip);
  }

  @Post(':id/generar-documentos')
  @RequirePermission('guardias:ordenes_editar')
  generarDocumentos(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.generarDocumentos(id, user.id, req.ip);
  }

  @Post(':id/revisar')
  @RequirePermission('guardias:ordenes_editar')
  revisar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.revisar(id, user.id, req.ip);
  }

  @Post(':id/volver-borrador')
  @RequirePermission('guardias:ordenes_editar')
  volverABorrador(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.volverABorrador(id, user.id, req.ip);
  }

  @Post(':id/aprobar')
  @RequirePermission('guardias:ordenes_aprobar')
  aprobar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.aprobar(id, user.id, req.ip);
  }

  @Post(':id/publicar')
  @RequirePermission('guardias:ordenes_publicar')
  publicar(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.publicar(id, user.id, req.ip);
  }

  @Post(':id/anular')
  @RequirePermission('guardias:ordenes_anular')
  anular(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AnularOrdenGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }

  @Get(':id/modificaciones')
  @RequirePermission('guardias:ordenes_ver')
  listarModificaciones(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.listarModificaciones(id);
  }

  @Post(':id/modificaciones')
  @RequirePermission('guardias:ordenes_editar')
  registrarModificacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RegistrarModificacionOrdenDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarModificacion(id, dto, user.id, req.ip);
  }
}
