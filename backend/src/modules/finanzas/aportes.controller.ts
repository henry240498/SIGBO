import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { guardarImagen, CARPETA_COMPROBANTES_FINANZAS } from '../../shared/utils/almacenamiento';
import { AportesService } from './aportes.service';
import { AnularAporteDto, RegistrarAporteDto } from './dto/aporte.dto';

const MIMETYPES_PERMITIDOS = /^(application\/pdf|image\/jpe?g|image\/png)$/;
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

@ApiTags('finanzas/aportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/aportes')
export class AportesController {
  constructor(private readonly service: AportesService) {}

  @Get()
  @RequirePermission('finanzas:socios_ver')
  findAll(
    @Query('socioProtectorId') socioProtectorId?: string,
    @Query('acuerdoAporteId') acuerdoAporteId?: string,
    @Query('esExtraordinario') esExtraordinario?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({
      socioProtectorId,
      acuerdoAporteId,
      esExtraordinario: esExtraordinario === undefined ? undefined : esExtraordinario === 'true',
      estado,
      desde,
      hasta,
    });
  }

  @Post()
  @RequirePermission('finanzas:aportes_registrar')
  registrar(@Body() dto: RegistrarAporteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.registrar(dto, user.id, req.ip);
  }

  @Post('comprobante')
  @RequirePermission('finanzas:aportes_registrar')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: TAMANO_MAXIMO_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!MIMETYPES_PERMITIDOS.test(file.mimetype)) {
          callback(new BadRequestException('Formato no permitido -- solo PDF, JPG o PNG'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async subirComprobante(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido (PDF, JPG o PNG, hasta 10MB)');
    const archivoUrl = await guardarImagen(file, CARPETA_COMPROBANTES_FINANZAS);
    return { archivoUrl };
  }

  @Get(':id')
  @RequirePermission('finanzas:socios_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/anular')
  @RequirePermission('finanzas:aportes_editar')
  anular(@Param('id') id: string, @Body() dto: AnularAporteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }
}
