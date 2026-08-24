import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Res,
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
import { PerfilService } from './perfil.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { Response } from 'express';

const OPCIONES_ARCHIVO = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (err: Error | null, ok: boolean) => void) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
      callback(new BadRequestException('El archivo debe ser una imagen (png, jpg, webp o gif)'), false);
      return;
    }
    callback(null, true);
  },
};

@ApiTags('seguridad/mi-perfil')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seguridad')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  /** Accesible para CUALQUIER usuario logueado, sin importar rol/permisos. */
  @Get('mi-perfil')
  obtenerMiPerfil(@CurrentUser() user: AuthenticatedUser) {
    return this.perfilService.obtenerPerfil(user.id, user.permisos);
  }

  @Get('mi-perfil/foto')
  async obtenerMiFoto(@CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const { buffer, mimeType } = await this.perfilService.obtenerFoto(user.id);
    res.set({ 'Content-Type': mimeType, 'Content-Length': String(buffer.length), 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    res.send(buffer);
  }

  @Put('mi-perfil')
  actualizarMiPerfil(@Body() dto: ActualizarPerfilDto, @CurrentUser() user: AuthenticatedUser) {
    return this.perfilService.actualizarPerfilPropio(user.id, dto, user.permisos);
  }

  @Put('mi-perfil/foto')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_ARCHIVO))
  actualizarMiFoto(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser) {
    if (!file) throw new BadRequestException('No se recibio ningun archivo');
    return this.perfilService.actualizarFotoPropia(user.id, file, user.permisos);
  }

  /* --- Panel de administracion: edita el perfil de CUALQUIER usuario,
     sin pasar por la politica Libre/Fijo (siempre permitido con este permiso). --- */

  @Get('usuarios/:id/perfil')
  @UseGuards(PermissionsGuard)
  @RequirePermission('seguridad:ver_usuarios')
  obtenerPerfilAdmin(@Param('id') id: string) {
    return this.perfilService.obtenerPerfil(id, ['seguridad:editar_usuario']);
  }

  @Get('usuarios/:id/perfil/foto')
  @UseGuards(PermissionsGuard)
  @RequirePermission('seguridad:ver_usuarios')
  async obtenerFotoAdmin(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.perfilService.obtenerFoto(id);
    res.set({ 'Content-Type': mimeType, 'Content-Length': String(buffer.length), 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    res.send(buffer);
  }

  @Put('usuarios/:id/perfil')
  @UseGuards(PermissionsGuard)
  @RequirePermission('seguridad:editar_usuario')
  actualizarPerfilAdmin(@Param('id') id: string, @Body() dto: ActualizarPerfilDto) {
    return this.perfilService.actualizarPerfilComoAdmin(id, dto);
  }

  @Put('usuarios/:id/perfil/foto')
  @UseGuards(PermissionsGuard)
  @RequirePermission('seguridad:editar_usuario')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_ARCHIVO))
  actualizarFotoAdmin(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibio ningun archivo');
    return this.perfilService.actualizarFotoComoAdmin(id, file);
  }
}
