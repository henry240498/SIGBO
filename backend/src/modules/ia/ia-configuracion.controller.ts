import { BadRequestException, Body, Controller, Get, Patch, Post, Req, UseFilters, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MulterExceptionFilter } from '../../shared/filters/multer-exception.filter';
import { IaConfiguracionService } from './ia-configuracion.service';
import { CambiarEstadoIaDto, EliminarIaDto, SeleccionarAvatarPredefinidoDto, UpdateConfiguracionIaDto } from './dto/configuracion-ia.dto';

const MIMETYPES_IMAGEN = /^image\/(png|jpe?g|webp)$/;
// Generoso a proposito: un PNG de personaje de cuerpo entero con canal
// alfa (fondo transparente) pesa mucho mas que una foto JPG comprimida.
const TAMANO_MAXIMO_AVATAR = 10 * 1024 * 1024;

@ApiTags('ia/admin/config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia/admin/config')
export class IaConfiguracionController {
  constructor(private readonly service: IaConfiguracionService) {}

  @Get()
  @RequirePermission('inteligencia:configurar')
  obtener() {
    return this.service.obtener();
  }

  @Get('historial')
  @RequirePermission('inteligencia:configurar')
  async historial() {
    const config = await this.service.obtener();
    return this.service.historial(config.id);
  }

  @Patch()
  @RequirePermission('inteligencia:configurar')
  actualizar(@Body() dto: UpdateConfiguracionIaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.actualizar(dto, user.id, req.ip ?? null);
  }

  @Post('avatar')
  @RequirePermission('inteligencia:configurar')
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: TAMANO_MAXIMO_AVATAR },
      fileFilter: (_req, file, callback) => {
        if (!MIMETYPES_IMAGEN.test(file.mimetype)) {
          return callback(new BadRequestException('Formato no soportado. Subí una imagen PNG, JPG o WEBP (PNG con fondo transparente para que el personaje flote).'), false);
        }
        callback(null, true);
      },
    }),
  )
  actualizarAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen.');
    return this.service.actualizarAvatar(file, user.id, req.ip ?? null);
  }

  /** Avatar predefinido (emoji + color, seccion "avatares sugeridos"):
   * sin archivo, no depende de que el navegador arme bien una URL contra
   * el backend -- se renderiza al instante. */
  @Post('avatar-predefinido')
  @RequirePermission('inteligencia:configurar')
  seleccionarAvatarPredefinido(@Body() dto: SeleccionarAvatarPredefinidoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.seleccionarAvatarPredefinido(dto, user.id, req.ip ?? null);
  }

  /** Borrado definitivo (nueva seccion pedida por la institucion): mas
   * alla de desactivar. Permiso exclusivo `inteligencia:eliminar`, solo
   * ADMIN via 'all' -- ningun rol lo recibe por defecto. */
  @Post('eliminar-definitivamente')
  @RequirePermission('inteligencia:eliminar')
  eliminarDefinitivamente(@Body() dto: EliminarIaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.eliminarDefinitivamente(dto, user.id, req.ip ?? null);
  }
}

@ApiTags('ia/admin/estado')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia/admin/estado')
export class IaEstadoController {
  constructor(private readonly service: IaConfiguracionService) {}

  /** Seccion 57-58 del pedido: apagado de emergencia / modo mantenimiento.
   * Permiso separado y mas restrictivo que `configurar` por lo sensible
   * de la accion. */
  @Patch()
  @RequirePermission('inteligencia:desactivar')
  cambiarEstado(@Body() dto: CambiarEstadoIaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.cambiarEstado(dto, user.id, req.ip ?? null);
  }
}
