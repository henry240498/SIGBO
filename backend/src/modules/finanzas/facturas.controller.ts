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
import { FacturasService } from './facturas.service';
import { AnularFacturaDto, CreateFacturaDto } from './dto/factura.dto';

const MIMETYPES_PERMITIDOS = /^(application\/pdf|image\/jpe?g|image\/png)$/;
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

@ApiTags('finanzas/facturas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/facturas')
export class FacturasController {
  constructor(private readonly service: FacturasService) {}

  @Get()
  @RequirePermission('finanzas:facturacion_ver')
  findAll(
    @Query('socioProtectorId') socioProtectorId?: string,
    @Query('estado') estado?: string,
    @Query('origen') origen?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ socioProtectorId, estado, origen, desde, hasta });
  }

  @Post()
  @RequirePermission('finanzas:facturacion_crear')
  create(@Body() dto: CreateFacturaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Post('archivo')
  @RequirePermission('finanzas:facturacion_crear')
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
  async subirArchivo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido (PDF, JPG o PNG, hasta 10MB)');
    const archivoUrl = await guardarImagen(file, CARPETA_COMPROBANTES_FINANZAS);
    return { archivoUrl };
  }

  @Get(':id')
  @RequirePermission('finanzas:facturacion_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/anular')
  @RequirePermission('finanzas:facturacion_anular')
  anular(@Param('id') id: string, @Body() dto: AnularFacturaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto.motivo, user.id, req.ip);
  }
}
