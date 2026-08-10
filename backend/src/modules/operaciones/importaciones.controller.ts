import { BadRequestException, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ImportacionesService } from './importaciones.service';
import { EstadoFilaImportacion } from '../../shared/entities';

const OPCIONES_ARCHIVO = {
  storage: memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (err: Error | null, ok: boolean) => void) => {
    if (!/\.(xls|xlsx)$/i.test(file.originalname)) {
      callback(new BadRequestException('El archivo debe ser un Excel (.xls o .xlsx) exportado del marcador biometrico'), false);
      return;
    }
    callback(null, true);
  },
};

@ApiTags('operaciones/importaciones-marcador')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/importaciones')
export class ImportacionesController {
  constructor(private readonly service: ImportacionesService) {}

  @Post('analizar')
  @RequirePermission('asistencia:importar_marcador')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo', OPCIONES_ARCHIVO))
  analizar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    if (!file) throw new BadRequestException('No se recibio ningun archivo');
    return this.service.analizar(file, user.id, req.ip);
  }

  @Get()
  @RequirePermission('asistencia:importar_marcador')
  historial() {
    return this.service.historial();
  }

  @Get(':id')
  @RequirePermission('asistencia:importar_marcador')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/filas')
  @RequirePermission('asistencia:importar_marcador')
  listarFilas(@Param('id') id: string, @Query('estadoFila') estadoFila?: EstadoFilaImportacion) {
    return this.service.listarFilas(id, estadoFila);
  }

  @Post(':id/confirmar')
  @RequirePermission('asistencia:importar_marcador')
  confirmar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.confirmar(id, user.id, req.ip);
  }

  @Post(':id/cancelar')
  @RequirePermission('asistencia:importar_marcador')
  cancelar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.cancelar(id, user.id, req.ip);
  }
}
