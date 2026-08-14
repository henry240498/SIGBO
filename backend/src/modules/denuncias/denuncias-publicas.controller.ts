import { BadRequestException, Body, Controller, Get, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CrearDenunciaPublicaDto } from './dto/crear-denuncia-publica.dto';
import { DenunciasService } from './denuncias.service';
import { RateLimit } from './decorators/rate-limit.decorator';
import { RateLimitGuard } from './guards/rate-limit.guard';

const ARCHIVOS_DENUNCIA = {
  storage: memoryStorage(),
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

  // El envio escribe en base y acepta hasta 25 MB de archivos en memoria: es el
  // que hay que proteger. 5 por hora deja margen para reintentos y corregir un
  // envio, y corta el abuso automatizado.
  @Post()
  @RateLimit({ nombre: 'denuncias-crear', ventanaMs: 3_600_000, maximo: 5, penalizacionMs: 900_000 })
  @UseGuards(OptionalJwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'audio', maxCount: 1 }, { name: 'evidencias', maxCount: 3 }], ARCHIVOS_DENUNCIA))
  crear(
    @Body() dto: CrearDenunciaPublicaDto,
    @UploadedFiles() archivos: { audio?: Express.Multer.File[]; evidencias?: Express.Multer.File[] },
    @Req() req: Request & { user?: AuthenticatedUser | null },
  ) {
    const userAgent = req.headers['user-agent'];
    if (Array.isArray(userAgent)) throw new BadRequestException('El agente del dispositivo no es válido');
    return this.service.crearPublica(dto, archivos ?? {}, { usuarioId: req.user?.id ?? null, ip: req.ip ?? null, userAgent: userAgent ?? null });
  }
}
