import { BadRequestException, Body, Controller, Get, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CrearDenunciaPublicaDto } from './dto/crear-denuncia-publica.dto';
import { DenunciasService } from './denuncias.service';
import { RateLimit } from './decorators/rate-limit.decorator';
import { RateLimitGuard } from './guards/rate-limit.guard';
import {
  almacenamientoTemporalDenuncias,
  eliminarArchivosTemporalesDenuncia,
  limpiarTemporalesDenuncia,
} from './denuncias-upload.storage';

const ARCHIVOS_DENUNCIA = {
  storage: almacenamientoTemporalDenuncias,
  limits: { fileSize: 10 * 1024 * 1024, files: 4, fields: 20 },
};

@ApiTags('denuncias públicas')
@Controller('denuncias/publicas')
@UseGuards(RateLimitGuard)
export class DenunciasPublicasController {
  constructor(private readonly service: DenunciasService) {}

  // Las consultas son baratas y alimentan el formulario mientras se completa:
  // el cupo es amplio para no estorbar a quien esta escribiendo una denuncia.
  @Get('categorias')
  @RateLimit({ nombre: 'denuncias-catalogos', ventanaMs: 60_000, maximo: 60, penalizacionMs: 60_000 })
  categorias() { return this.service.categoriasPublicas(); }

  @Get('servicios')
  @RateLimit({ nombre: 'denuncias-catalogos', ventanaMs: 60_000, maximo: 60, penalizacionMs: 60_000 })
  servicios(@Query('q') q?: string) { return this.service.buscarServiciosPublicos(q); }

  // El envio acepta un audio de hasta 10 MB y tres evidencias de hasta 5 MB.
  // Multer los recibe temporalmente fuera del directorio publico y el servicio
  // los procesa de a uno; 5 por hora deja margen para reintentos.
  @Post()
  @RateLimit({ nombre: 'denuncias-crear', ventanaMs: 3_600_000, maximo: 5, penalizacionMs: 900_000 })
  @UseGuards(OptionalJwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'audio', maxCount: 1 }, { name: 'evidencias', maxCount: 3 }], ARCHIVOS_DENUNCIA))
  async crear(
    @Body() dto: CrearDenunciaPublicaDto,
    @UploadedFiles() archivos: { audio?: Express.Multer.File[]; evidencias?: Express.Multer.File[] },
    @Req() req: Request & { user?: AuthenticatedUser | null },
  ) {
    const userAgent = req.headers['user-agent'];
    if (Array.isArray(userAgent)) throw new BadRequestException('El agente del dispositivo no es válido');
    const adjuntos = archivos ?? {};
    await limpiarTemporalesDenuncia();
    try {
      return await this.service.crearPublica(dto, adjuntos, { usuarioId: req.user?.id ?? null, ip: req.ip ?? null, userAgent: userAgent ?? null });
    } finally {
      await eliminarArchivosTemporalesDenuncia(adjuntos);
    }
  }
}
