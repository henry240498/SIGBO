import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { DocumentosService } from './documentos.service';
import {
  AnularDocumentoDto,
  CambiarEstadoDocumentoDto,
  CreateDocumentoDto,
  CrearRelacionDto,
  SubirArchivoDto,
  UpdateDocumentoDto,
} from './dto/documento.dto';
import { GuardarNumeracionDto } from './dto/numeracion.dto';

/** Extensiones/mimetypes permitidos (seccion 26 del pedido): PDF, Word,
 * Excel, imagenes -- validado realmente en backend via fileFilter de
 * multer, nunca solo por el input del frontend. */
const MIMETYPES_PERMITIDOS = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|image\/jpe?g|image\/png)$/;
const TAMANO_MAXIMO_BYTES = 20 * 1024 * 1024; // 20MB

/** Formatos que el navegador puede renderizar sin conversion (seccion 1
 * del pedido): PDF e imagenes van directo al visor integrado. Word/Excel
 * no tienen motor de conversion disponible en este entorno -- el
 * frontend lo detecta por `archivoExtension` y ofrece descargar en vez
 * de forzar un iframe que el navegador no sabe interpretar. */
const MIME_PREVISUALIZABLE: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

@ApiTags('documentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly service: DocumentosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  @Get()
  @RequirePermission('documentos:ver')
  findAll(
    @Query('q') q?: string,
    @Query('tipoDocumentoId') tipoDocumentoId?: string,
    @Query('categoriaDocumentoId') categoriaDocumentoId?: string,
    @Query('estadoId') estadoId?: string,
    @Query('origen') origen?: string,
    @Query('expedienteId') expedienteId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('vencimiento') vencimiento?: 'PROXIMOS' | 'VENCIDOS',
  ) {
    return this.service.findAll({ q, tipoDocumentoId, categoriaDocumentoId, estadoId, origen, expedienteId, desde, hasta, vencimiento });
  }

  @Get('relacionados/:modulo/:entidad/:registroId')
  @RequirePermission('documentos:ver')
  documentosDeEntidad(
    @Param('modulo') modulo: string,
    @Param('entidad') entidad: string,
    @Param('registroId') registroId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.documentosDeEntidad(modulo, entidad, registroId, user.permisos);
  }

  /** Auditoria de todo el modulo (seccion 30/42), gateada por
   * documentos:ver_auditoria -- distinta de seguridad:ver_logs, que exige
   * un permiso mas privilegiado para logs de todo el sistema. Declarada
   * ANTES de `:id` a proposito: ver el comentario en documentos.module.ts
   * sobre el orden de registro de rutas. */
  @Get('auditoria')
  @RequirePermission('documentos:ver_auditoria')
  auditoriaGeneral(
    @Query('accion') accion?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditoriaService.findAll({
      recursoPrefijo: 'documentos.',
      accion,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : 50,
    });
  }

  /** Configuracion de numeracion (secciones 3-13): declarada ANTES de
   * `:id` por el mismo motivo que `auditoria` arriba -- si no, Nest
   * interpretaria "numeraciones" como un id de documento. Gateada por
   * `organizacion:documentos_configurar` (la MISMA que ya protege la
   * pantalla Organizacion Institucional -> Configuracion de Documentos,
   * seccion 16: "restringir a usuarios autorizados" sin inventar un
   * permiso nuevo para lo que ya es esa pantalla). */
  @Get('numeraciones')
  @RequirePermission('organizacion:documentos_configurar')
  numeraciones() {
    return this.service.listarNumeraciones();
  }

  @Put('numeraciones')
  @RequirePermission('organizacion:documentos_configurar')
  guardarNumeracion(@Body() dto: GuardarNumeracionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.guardarNumeracion(dto, user.id, req.ip);
  }

  /** Sugerencia de "siguiente numero" sin consumirlo (seccion 5-6):
   * gateada por `documentos:crear` -- cualquiera que pueda crear un
   * documento necesita ver la sugerencia antes de decidir aceptarla o
   * escribir un numero distinto. */
  @Get('numeraciones/:tipoDocumentoId/siguiente')
  @RequirePermission('documentos:crear')
  previsualizarSiguienteNumero(@Param('tipoDocumentoId') tipoDocumentoId: string, @Query('anio') anio?: string) {
    return this.service.previsualizarSiguienteNumero(tipoDocumentoId, anio ? Number(anio) : new Date().getFullYear());
  }

  @Get(':id')
  @RequirePermission('documentos:ver')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const documento = await this.service.findOne(id, user.permisos);
    await this.service.registrarVista(id, user.id, req.ip);
    return { ...documento, alertaVigencia: this.service.alertaVigencia(documento) };
  }

  @Get(':id/versiones')
  @RequirePermission('documentos:ver')
  versiones(@Param('id') id: string) {
    return this.service.versiones(id);
  }

  @Get(':id/relaciones')
  @RequirePermission('documentos:ver')
  relaciones(@Param('id') id: string) {
    return this.service.relacionesDe(id);
  }

  @Get(':id/auditoria')
  @RequirePermission('documentos:ver_auditoria')
  auditoria(@Param('id') id: string) {
    return this.auditoriaService.findAll({ recurso: 'documentos.documentos_institucionales', recursoId: id, pageSize: 100 });
  }

  @Get(':id/archivo')
  @RequirePermission('documentos:descargar')
  async descargar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request, @Res() res: Response) {
    const documento = await this.service.findOne(id, user.permisos);
    if (!documento.archivoUrl) {
      res.status(404).json({ message: 'Este documento no tiene un archivo digital cargado' });
      return;
    }
    await this.service.registrarDescarga(id, user.id, req.ip);
    const rutaAbsoluta = join(process.cwd(), documento.archivoUrl.replace(/^\//, ''));
    if (documento.archivoNombreOriginal) {
      res.download(rutaAbsoluta, documento.archivoNombreOriginal);
    } else {
      res.download(rutaAbsoluta);
    }
  }

  /** Vista previa embebida (seccion 1 del pedido): mismo chequeo de
   * permisos/confidencialidad que descargar(), pero `Content-Disposition:
   * inline` en vez de `attachment` -- el navegador renderiza en vez de
   * forzar el dialogo de guardado. Nunca modifica el archivo original.
   * Solo PDF/imagen (MIME_PREVISUALIZABLE); otros formatos responden 415
   * para que el frontend ofrezca descargar en su lugar. */
  @Get(':id/vista-previa')
  @RequirePermission('documentos:ver')
  async previsualizar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request, @Res() res: Response) {
    const documento = await this.service.findOne(id, user.permisos);
    if (!documento.archivoUrl) {
      res.status(404).json({ message: 'Este documento no tiene un archivo digital cargado' });
      return;
    }
    const mime = MIME_PREVISUALIZABLE[(documento.archivoExtension ?? '').toLowerCase()];
    if (!mime) {
      res.status(415).json({ message: 'Este formato no admite vista previa en el navegador -- descargue el archivo' });
      return;
    }
    await this.service.registrarVista(id, user.id, req.ip);
    const rutaAbsoluta = join(process.cwd(), documento.archivoUrl.replace(/^\//, ''));
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(rutaAbsoluta);
  }

  @Post()
  @RequirePermission('documentos:crear')
  crear(@Body() dto: CreateDocumentoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.crear(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('documentos:editar')
  actualizar(@Param('id') id: string, @Body() dto: UpdateDocumentoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.actualizar(id, dto, user.id, req.ip);
  }

  @Post(':id/archivo')
  @RequirePermission('documentos:subir')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: TAMANO_MAXIMO_BYTES },
      fileFilter: (_req, file, callback) => callback(null, MIMETYPES_PERMITIDOS.test(file.mimetype)),
    }),
  )
  subirArchivo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() dto: SubirArchivoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    if (!file) throw new Error('Archivo requerido o formato no permitido (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)');
    return this.service.subirArchivo(id, file, dto.motivo, user.id, req.ip);
  }

  @Patch(':id/estado')
  @RequirePermission('documentos:editar')
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoDocumentoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.cambiarEstado(id, dto, user.id, req.ip);
  }

  @Post(':id/aprobar')
  @RequirePermission('documentos:aprobar')
  async aprobar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const estadoAprobadoId = await this.service.obtenerParametro('ESTADO_DOCUMENTO', 'Aprobado');
    return this.service.cambiarEstado(id, { estadoId: estadoAprobadoId }, user.id, req.ip);
  }

  @Post(':id/publicar')
  @RequirePermission('documentos:aprobar')
  async publicar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const estadoPublicadoId = await this.service.obtenerParametro('ESTADO_DOCUMENTO', 'Publicado');
    return this.service.cambiarEstado(id, { estadoId: estadoPublicadoId }, user.id, req.ip);
  }

  @Post(':id/anular')
  @RequirePermission('documentos:anular')
  anular(@Param('id') id: string, @Body() dto: AnularDocumentoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }

  @Post(':id/archivar')
  @RequirePermission('documentos:editar')
  archivar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.archivar(id, user.id, req.ip);
  }

  @Post(':id/reabrir')
  @RequirePermission('documentos:administrar')
  reabrir(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.reabrir(id, user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermission('documentos:eliminar')
  eliminar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.eliminar(id, user.id, req.ip);
  }

  @Post(':id/relaciones')
  @RequirePermission('documentos:editar')
  relacionar(@Param('id') id: string, @Body() dto: CrearRelacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.relacionar(id, dto, user.id, req.ip);
  }

  @Delete('relaciones/:relacionId')
  @RequirePermission('documentos:editar')
  desrelacionar(@Param('relacionId') relacionId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.desrelacionar(relacionId, user.id, req.ip);
  }
}
