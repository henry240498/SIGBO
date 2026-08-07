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
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AparienciaService, CampoImagen } from './apariencia.service';
import { ActualizarAparienciaDto } from './dto/actualizar-apariencia.dto';
import { ActualizarPoliticaPerfilDto } from './dto/actualizar-politica-perfil.dto';

const CAMPOS_IMAGEN: Record<string, CampoImagen> = {
  'logo-login': 'logoLogin',
  'fondo-login': 'fondoLogin',
  'logo-menu': 'logoMenu',
};

@ApiTags('seguridad/apariencia')
@Controller('seguridad/apariencia')
export class AparienciaController {
  constructor(private readonly service: AparienciaService) {}

  /** Publico a proposito: la pantalla de login y el menu lo necesitan antes de autenticarse. */
  @Get()
  obtener() {
    return this.service.obtener();
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('seguridad:configurar_apariencia')
  actualizar(@Body() dto: ActualizarAparienciaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.actualizarTextos(dto, user.id);
  }

  @Put('imagen/:campo')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('seguridad:configurar_apariencia')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype)) {
          callback(new BadRequestException('El archivo debe ser una imagen (png, jpg, webp, gif o svg)'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async actualizarImagen(
    @Param('campo') campo: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const campoValido = CAMPOS_IMAGEN[campo];
    if (!campoValido) {
      throw new BadRequestException(`Campo de imagen invalido. Use: ${Object.keys(CAMPOS_IMAGEN).join(', ')}`);
    }
    if (!file) {
      throw new BadRequestException('No se recibio ningun archivo');
    }
    return this.service.actualizarImagen(campoValido, file, user.id);
  }

  @Put('politica-perfil')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('seguridad:configurar_politica_perfil')
  actualizarPoliticaPerfil(@Body() dto: ActualizarPoliticaPerfilDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.actualizarPoliticaPerfil(dto.perfilEdicionLibre, user.id);
  }
}
