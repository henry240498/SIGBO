import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CertificacionesAcademiaService } from './certificaciones-academia.service';
import { CreateCertificacionDto } from './dto/create-certificacion.dto';
import { UpdateCertificacionDto } from './dto/update-certificacion.dto';

const OPCIONES_ARCHIVO = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (err: Error | null, ok: boolean) => void) => {
    if (!/^(image\/(png|jpe?g|webp|gif)|application\/pdf)$/.test(file.mimetype)) {
      callback(new BadRequestException('El certificado debe ser una imagen (png, jpg, webp, gif) o un PDF'), false);
      return;
    }
    callback(null, true);
  },
};

/** No todas las rutas usan @RequirePermission: la creacion/edicion/borrado
 * permiten autoservicio (el bombero gestiona SU PROPIA certificacion sin
 * academia:certificar) -- el chequeo real vive en el service, que compara
 * el bombero objetivo contra el usuario autenticado (seccion 15 del pedido). */
@ApiTags('academia/certificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class CertificacionesAcademiaController {
  constructor(private readonly service: CertificacionesAcademiaService) {}

  @Get('personal/bomberos/:bomberoId/certificaciones')
  @RequirePermission('personal:ver')
  listarPorBombero(@Param('bomberoId') bomberoId: string) {
    return this.service.listarPorBombero(bomberoId);
  }

  @Post('academia/certificaciones')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_ARCHIVO))
  crear(
    @Body() dto: CreateCertificacionDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.create(dto, file, user.id, user.permisos, req.ip);
  }

  @Patch('academia/certificaciones/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_ARCHIVO))
  actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateCertificacionDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, file, user.id, user.permisos, req.ip);
  }

  @Delete('academia/certificaciones/:id')
  eliminar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.eliminar(id, user.id, user.permisos, req.ip);
  }
}
