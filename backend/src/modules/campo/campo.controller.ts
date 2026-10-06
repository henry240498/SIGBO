import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { AdjuntosService, MAX_BYTES_ADJUNTO } from './adjuntos.service';
import { AusenciasService } from './ausencias.service';
import { CancelarAusenciaDto, DecidirAusenciaDto, RegistrarVictimasDto, SolicitarAusenciaDto, SubirAdjuntoDto } from './dto/campo.dto';
import { VictimasService } from './victimas.service';

const ENTIDADES = ['SERVICIO', 'DESPACHO', 'VEHICULO', 'HIDRANTE', 'PUNTO_RIESGO'] as const;

/** Fotos y firmas de terreno, victimas por servicio y ausencias del personal. */
@ApiTags('campo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class CampoController {
  constructor(
    private readonly adjuntos: AdjuntosService,
    private readonly victimas: VictimasService,
    private readonly ausencias: AusenciasService,
  ) {}

  private ctx(user: AuthenticatedUser, req: Request) {
    return { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] };
  }
  private ctxAus(user: AuthenticatedUser, req: Request) {
    return { ...this.ctx(user, req), puedeDecidir: user.permisos.includes('ausencias:decidir') };
  }

  // ---- adjuntos ----

  @Post('adjuntos')
  @ApiConsumes('multipart/form-data')
  @RequirePermission('adjuntos:subir')
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage(), limits: { fileSize: MAX_BYTES_ADJUNTO, files: 1 } }))
  subir(@Body() dto: SubirAdjuntoDto, @UploadedFile() archivo: Express.Multer.File | undefined, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.adjuntos.subir(archivo, dto, this.ctx(user, req));
  }

  @Get('adjuntos')
  @RequirePermission('adjuntos:ver')
  listarAdjuntos(@Query('entidad') entidad: string, @Query('entidadId', new ParseUUIDPipe()) entidadId: string) {
    if (!(ENTIDADES as readonly string[]).includes(entidad)) throw new BadRequestException('Entidad no valida.');
    return this.adjuntos.listar(entidad as (typeof ENTIDADES)[number], entidadId);
  }

  @Get('adjuntos/:id/archivo')
  @RequirePermission('adjuntos:ver')
  async archivo(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response) {
    const { buffer, mime } = await this.adjuntos.archivo(id);
    res.set({ 'Content-Type': mime, 'Content-Length': String(buffer.length), 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' });
    res.send(buffer);
  }

  // ---- victimas ----

  @Get('siniestros/victimas')
  @RequirePermission('servicios:ver')
  victimasDe(@Query('servicioId', new ParseUUIDPipe()) servicioId: string) {
    return this.victimas.deServicio(servicioId);
  }

  @Post('siniestros/victimas')
  @RequirePermission('servicios:editar')
  registrarVictimas(@Body() dto: RegistrarVictimasDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.victimas.registrar(dto, this.ctx(user, req));
  }

  // ---- ausencias ----

  @Get('ausencias')
  @RequirePermission('ausencias:solicitar')
  listarAusencias(@Query('estado') estado: string | undefined, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const valido = ['SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA'].includes(estado ?? '') ? (estado as 'SOLICITADA') : undefined;
    return this.ausencias.listar(this.ctxAus(user, req), valido);
  }

  @Post('ausencias')
  @RequirePermission('ausencias:solicitar')
  solicitarAusencia(@Body() dto: SolicitarAusenciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.ausencias.solicitar(dto, this.ctxAus(user, req));
  }

  @Patch('ausencias/:id/decision')
  @RequirePermission('ausencias:decidir')
  decidirAusencia(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: DecidirAusenciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.ausencias.decidir(id, dto, this.ctxAus(user, req));
  }

  @Patch('ausencias/:id/cancelar')
  @RequirePermission('ausencias:solicitar')
  cancelarAusencia(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CancelarAusenciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.ausencias.cancelar(id, dto, this.ctxAus(user, req));
  }
}
