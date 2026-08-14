import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { AsignarDenunciaDto } from './dto/asignar-denuncia.dto';
import { CambiarEstadoDenunciaDto } from './dto/cambiar-estado-denuncia.dto';
import { ActualizarCategoriaDenunciaDto, CrearCategoriaDenunciaDto } from './dto/categoria-denuncia.dto';
import { DenunciasService } from './denuncias.service';

function contexto(user: AuthenticatedUser, req: Request) { return { usuarioId: user.id, ip: req.ip ?? null, userAgent: (req.headers['user-agent'] as string | undefined) ?? null }; }

@ApiTags('denuncias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('denuncias')
export class DenunciasController {
  constructor(private readonly service: DenunciasService) {}

  @Get() @RequirePermission('denuncias:ver') listar(@Query() filtros: Record<string, string>) { return this.service.listar(filtros); }
  @Get('resumen') @RequirePermission('denuncias:ver') resumen() { return this.service.resumen(); }
  @Get('asignables') @RequirePermission('denuncias:asignar') asignables() { return this.service.asignables(); }
  @Get('categorias') @RequirePermission('denuncias:configurar_categorias') categorias() { return this.service.categoriasInternas(); }
  @Post('categorias') @RequirePermission('denuncias:configurar_categorias') crearCategoria(@Body() dto: CrearCategoriaDenunciaDto) { return this.service.crearCategoria(dto); }
  @Patch('categorias/:id') @RequirePermission('denuncias:configurar_categorias') actualizarCategoria(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarCategoriaDenunciaDto) { return this.service.actualizarCategoria(id, dto); }

  @Get(':id/archivos/:archivoId') @RequirePermission('denuncias:ver')
  async descargar(@Param('id', ParseUUIDPipe) id: string, @Param('archivoId', ParseUUIDPipe) archivoId: string, @Res() res: Response) {
    const { evidencia, buffer } = await this.service.leerEvidencia(id, archivoId);
    res.set({ 'Content-Type': evidencia.mimeType, 'Content-Length': String(buffer.length), 'Content-Disposition': `inline; filename="${evidencia.nombreOriginal.replace(/["\\]/g, '_')}"`, 'Cache-Control': 'private, no-store' });
    res.send(buffer);
  }

  @Get(':id')
  @RequirePermission('denuncias:ver')
  obtener(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.obtener(id, user.permisos.includes('denuncias:ver_datos_tecnicos')); }

  @Patch(':id/estado')
  @RequirePermission('denuncias:gestionar', 'denuncias:cerrar')
  cambiarEstado(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CambiarEstadoDenunciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    if (['CERRADA', 'RESUELTA', 'DESCARTADA', 'DUPLICADA'].includes(dto.estado) && !user.permisos.includes('denuncias:cerrar')) throw new ForbiddenException('No tenés permiso para cerrar o descartar denuncias');
    return this.service.cambiarEstado(id, dto.estado, dto.comentario, contexto(user, req));
  }

  @Post(':id/asignar') @RequirePermission('denuncias:asignar')
  asignar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AsignarDenunciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) { return this.service.asignar(id, dto.usuarioId, dto.comentario, contexto(user, req)); }
}
