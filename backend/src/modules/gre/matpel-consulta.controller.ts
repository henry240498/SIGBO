import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { BuscarMatpelDto, EvaluarMatpelDto, EvaluarMatpelV2Dto, TablaMatpelDto, VersionMatpelDto } from './dto/matpel-consulta.dto';
import { MatpelConsultaService } from './matpel-consulta.service';
import { MotorMatpelService } from './motor-matpel.service';
import { geometriaMatpel } from './matpel-geometria';
import { createHash } from 'crypto';

@ApiTags('matpel-consulta')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('matpel:consultar')
@Controller('matpel')
export class MatpelConsultaController {
  constructor(private readonly consulta: MatpelConsultaService, private readonly motor: MotorMatpelService) {}
  @Get('estado') estado() { return this.consulta.estado(); }
  @Get('buscar') buscar(@Query() dto: BuscarMatpelDto) { return this.consulta.buscar(dto); }
  @Get('materiales/:entradaId') material(@Param('entradaId', ParseUUIDPipe) id: string, @Query() dto: VersionMatpelDto) {
    return this.consulta.material(dto.versionGreId, id);
  }
  @Get('guias/:numero') guia(@Param('numero') numero: string, @Query() dto: VersionMatpelDto) {
    return this.consulta.guia(dto.versionGreId, numero);
  }
  @Get('secciones') secciones(@Query() dto: VersionMatpelDto) { return this.consulta.secciones(dto.versionGreId); }
  @Get('secciones/:seccionId') seccion(@Param('seccionId', ParseUUIDPipe) id: string, @Query() dto: VersionMatpelDto) {
    return this.consulta.secciones(dto.versionGreId, id);
  }
  @Get('tablas/:tablaId') tabla(@Param('tablaId') id: string, @Query() dto: TablaMatpelDto) {
    return this.consulta.tabla(dto.versionGreId, id, dto.pagina, dto.limite, dto.identificador);
  }
  @Get('fuentes/:referenciaId') fuente(@Param('referenciaId', ParseUUIDPipe) id: string, @Query() dto: VersionMatpelDto) {
    return this.consulta.fuente(dto.versionGreId, id);
  }
  @Get('versiones/:versionGreId/archivo') async archivo(@Param('versionGreId', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { documento, buffer } = await this.consulta.archivo(id);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="GRE-${documento.edicion.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf"`,
      'Content-Length': buffer.length.toString(), 'Cache-Control': 'private, no-store', ETag: `"${documento.sha256}"` });
    res.end(buffer);
  }
  @Post('evaluaciones/consulta') async evaluar(@Body() dto: EvaluarMatpelDto) {
    const c = await this.consulta.leer(dto.versionGreId);
    const evaluacion = this.motor.evaluar(dto.entradaIds, dto.parametros as any, c);
    return { ...evaluacion, geometria: geometriaMatpel(evaluacion, dto.parametros as any, c) };
  }
  @Get('versiones/:versionGreId/paquete') paquete(@Param('versionGreId', ParseUUIDPipe) id: string) { return this.consulta.paquete(id); }
  @Post('evaluaciones/consulta-v2') async evaluarV2(@Body() dto: EvaluarMatpelV2Dto) {
    const c = await this.consulta.leer(dto.versionGreId);
    const evaluacion = this.motor.evaluar(dto.entradaIds, dto.parametros as any, c,
      { identificaciones: dto.identificaciones as any, ambito: dto.ambito as any });
    return { ...evaluacion, versionContrato: 2, geometria: geometriaMatpel(evaluacion, dto.parametros as any, c) };
  }
  @Get('versiones/:versionGreId/paquete/manifest') async manifest(@Param('versionGreId', ParseUUIDPipe) id: string) {
    const { manifest } = await this.consulta.partes(id);
    return { manifest };
  }
  @Get('versiones/:versionGreId/paquete/partes/:parte') async parte(@Param('versionGreId', ParseUUIDPipe) id: string,
    @Param('parte') parte: string, @Res() res: Response) {
    if (!['catalogo', 'pdf', 'interpretacion'].includes(parte)) {
      // Nunca resolver una ruta recibida por HTTP.
      res.status(404).end(); return;
    }
    const partes = await this.consulta.partes(id);
    const buffer: Buffer = partes[parte];
    res.set({ 'Content-Type': parte === 'pdf' ? 'application/pdf' : 'application/json; charset=utf-8',
      'Content-Length': String(buffer.length), 'Cache-Control': 'private, no-store',
      'X-Content-SHA256': createHash('sha256').update(buffer).digest('hex'),
      'Access-Control-Expose-Headers': 'X-Content-SHA256' });
    res.end(buffer);
  }
  @Get('versiones/:versionGreId/paquete/archivo') async paqueteArchivo(@Param('versionGreId', ParseUUIDPipe) id: string, @Res() res: Response) {
    const buffer = Buffer.from(await this.consulta.paquete(id, true) as string, 'utf8');
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `attachment; filename="GRE-${id}-consulta-local.html"`,
      'Content-Length': String(buffer.length), 'Cache-Control': 'private, no-store', 'Access-Control-Expose-Headers': 'X-Content-SHA256', 'X-Content-SHA256': createHash('sha256').update(buffer).digest('hex') });
    res.end(buffer);
  }
}
