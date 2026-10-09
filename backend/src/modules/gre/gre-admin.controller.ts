import {
  Body, Controller, Get, NotFoundException, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { GreDocumento, GrePagina, GreReferencia, GreVersion } from '../../shared/entities';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import {
  ActivarVersionDto, CompararVersionesDto, ReferenciasGreDto, RegistrarRevisionDto, SolicitarImportacionDto, ValidarVersionDto,
} from './dto/gre-admin.dto';
import { GreActivacionService } from './gre-activacion.service';
import { GreComparacionService } from './gre-comparacion.service';
import { GreFuentesService } from './gre-fuentes.service';
import { ContextoGre, GreImportacionService } from './gre-importacion.service';
import { GreRevisionService } from './gre-revision.service';

/**
 * Administración de la GRE (fase 3D): fuentes, importación, revisión dato ↔ fuente,
 * validación, comparación y activación. Cada capacidad es un permiso propio; administrar
 * no concede validar ni activar, y ninguna concede mando sobre un incidente.
 *  - matpel:administrar_gre  descubrir fuentes, importar, comparar
 *  - matpel:validar_gre      revisar y validar una versión candidata
 *  - matpel:activar_gre      activar o recuperar una versión validada
 */
@ApiTags('matpel-administracion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('matpel/administracion')
export class GreAdminController {
  constructor(
    private readonly importacion: GreImportacionService,
    private readonly revision: GreRevisionService,
    private readonly comparacion: GreComparacionService,
    private readonly activacion: GreActivacionService,
    private readonly fuentes: GreFuentesService,
    @InjectDataSource() private readonly ds: DataSource,
  ) {}

  private ctx(user: AuthenticatedUser, req: Request): ContextoGre {
    return { usuarioId: user.id, ip: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
  }

  @Get('documentos')
  @RequirePermission('matpel:administrar_gre')
  documentos() {
    return this.importacion.documentos();
  }

  @Post('importaciones')
  @RequirePermission('matpel:administrar_gre')
  solicitar(@Body() dto: SolicitarImportacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.importacion.solicitar(dto.documentoSeleccionId, dto.claveIdempotencia, this.ctx(user, req));
  }

  @Get('importaciones/:importacionId')
  @RequirePermission('matpel:administrar_gre')
  importacionEstado(@Param('importacionId', ParseUUIDPipe) id: string) {
    return this.importacion.estado(id);
  }

  @Get('versiones')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre', 'matpel:activar_gre')
  versiones() {
    return this.revision.versiones();
  }

  @Get('versiones/:versionGreId/progreso')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre')
  progreso(@Param('versionGreId', ParseUUIDPipe) versionId: string) {
    return this.revision.progreso(versionId);
  }

  @Get('versiones/:versionGreId/referencias')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre')
  referencias(@Param('versionGreId', ParseUUIDPipe) versionId: string, @Query() dto: ReferenciasGreDto) {
    return this.revision.referencias(versionId, dto.paginaPdf, dto.pagina, dto.tamano);
  }

  @Get('versiones/:versionGreId/tablas/:tablaCodigo/paginas/:paginaPdf')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre')
  filasDePagina(@Param('versionGreId', ParseUUIDPipe) versionId: string, @Param('tablaCodigo') tabla: string,
    @Param('paginaPdf', ParseIntPipe) pagina: number) {
    if (!['TABLA_1', 'TABLA_2', 'TABLA_3'].includes(tabla)) throw new NotFoundException('Tabla desconocida.');
    return this.revision.filasDePagina(versionId, tabla, pagina);
  }

  @Post('versiones/:versionGreId/revisiones')
  @RequirePermission('matpel:validar_gre')
  revisar(@Param('versionGreId', ParseUUIDPipe) versionId: string, @Body() dto: RegistrarRevisionDto,
    @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.revision.registrar(versionId, { filaIds: dto.filaIds, referenciaIds: dto.referenciaIds, pagina: dto.pagina },
      dto.resultado, dto.fundamento, dto.valorPropuesto ?? null, dto.claveIdempotencia, this.ctx(user, req));
  }

  @Post('versiones/:versionGreId/validacion')
  @RequirePermission('matpel:validar_gre')
  validar(@Param('versionGreId', ParseUUIDPipe) versionId: string, @Body() dto: ValidarVersionDto,
    @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.revision.validar(versionId, dto.fundamento, dto.claveIdempotencia, this.ctx(user, req));
  }

  @Get('versiones/:versionGreId/fuentes/:referenciaId')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre')
  async fuente(@Param('versionGreId', ParseUUIDPipe) versionId: string, @Param('referenciaId', ParseUUIDPipe) referenciaId: string) {
    const referencia = await this.ds.getRepository(GreReferencia).findOneBy({ id: referenciaId, versionId });
    if (!referencia) throw new NotFoundException('La referencia no pertenece a esta versión.');
    const pagina = await this.ds.getRepository(GrePagina).findOneByOrFail({ versionId, paginaPdf: referencia.paginaPdf });
    this.fuentes.validarReferencia(referencia, pagina);
    return { id: referencia.id, versionGreId: versionId, paginaPdf: referencia.paginaPdf, etiquetaPdf: pagina.etiquetaPdf,
      etiquetasImpresas: JSON.parse(pagina.etiquetasImpresasJson), anchoPt: pagina.anchoPt, altoPt: pagina.altoPt,
      rotacion: pagina.rotacion, cajaPt: referencia.cajaPtJson ? JSON.parse(referencia.cajaPtJson) : null,
      textoOriginal: referencia.textoOriginal, metodo: referencia.metodo, estadoRevision: referencia.estadoRevision };
  }

  @Get('versiones/:versionGreId/archivo')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre')
  async archivo(@Param('versionGreId', ParseUUIDPipe) versionId: string, @Res() res: Response) {
    const version = await this.ds.getRepository(GreVersion).findOneBy({ id: versionId });
    if (!version) throw new NotFoundException('La versión GRE no existe.');
    const documento = await this.ds.getRepository(GreDocumento).findOneByOrFail({ id: version.documentoId });
    const contenido = await this.fuentes.leerDocumento(documento);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="GRE-${documento.edicion}.pdf"`,
      'Cache-Control': 'private, no-store', ETag: `"${documento.sha256}"`, 'X-Content-Type-Options': 'nosniff' });
    res.send(contenido);
  }

  @Get('comparacion')
  @RequirePermission('matpel:administrar_gre')
  comparar(@Query() dto: CompararVersionesDto) {
    return this.comparacion.comparar(dto.versionAnteriorId, dto.versionCandidataId);
  }

  @Get('activacion')
  @RequirePermission('matpel:administrar_gre', 'matpel:validar_gre', 'matpel:activar_gre')
  activacionEstado() {
    return this.activacion.estado();
  }

  @Post('activacion')
  @RequirePermission('matpel:activar_gre')
  activar(@Body() dto: ActivarVersionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.activacion.activar(dto.versionGreId, dto.revisionActivacionEsperada, dto.motivo, dto.claveIdempotencia,
      this.ctx(user, req));
  }
}
