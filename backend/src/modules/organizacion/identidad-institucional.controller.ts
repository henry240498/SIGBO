import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IdentidadInstitucionalService, CampoLogo } from './identidad-institucional.service';
import { ActualizarIdentidadInstitucionalDto } from './dto/actualizar-identidad-institucional.dto';

const CAMPOS_LOGO: Record<string, CampoLogo> = {
  izquierda: 'logoIzquierdaUrl',
  derecha: 'logoDerechaUrl',
};

@ApiTags('organizacion/identidad-institucional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/identidad-institucional')
export class IdentidadInstitucionalController {
  constructor(private readonly service: IdentidadInstitucionalService) {}

  @Get()
  @RequirePermission('organizacion:documentos_ver')
  obtener() {
    return this.service.obtener();
  }

  @Put()
  @RequirePermission('organizacion:documentos_configurar')
  actualizar(@Body() dto: ActualizarIdentidadInstitucionalDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.actualizar(dto, user.id);
  }

  @Put('logo/:lado')
  @ApiConsumes('multipart/form-data')
  @RequirePermission('organizacion:documentos_configurar')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        // Sin SVG a proposito: estos logos se dibujan con pdfkit (doc.image())
        // dentro del PDF, que no rasteriza SVG y falla en silencio.
        if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
          callback(new BadRequestException('El logo debe ser una imagen (png, jpg, webp o gif); SVG no se puede incrustar en el PDF'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async actualizarLogo(
    @Param('lado') lado: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const campo = CAMPOS_LOGO[lado];
    if (!campo) {
      throw new BadRequestException(`Lado de logo invalido. Use: ${Object.keys(CAMPOS_LOGO).join(', ')}`);
    }
    if (!file) {
      throw new BadRequestException('No se recibio ningun archivo');
    }
    return this.service.actualizarLogo(campo, file, user.id);
  }
}
