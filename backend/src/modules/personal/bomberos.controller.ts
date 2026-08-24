import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { BomberosService } from './bomberos.service';
import { CreateBomberoDto } from './dto/create-bombero.dto';
import { UpdateBomberoDto } from './dto/update-bombero.dto';
import { AutorizacionFirmaDto } from './dto/autorizacion-firma.dto';

@ApiTags('personal/bomberos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class BomberosController {
  constructor(private readonly bomberosService: BomberosService) {}

  @Get()
  @RequirePermission('personal:ver')
  findAll(@Query('estado') estado?: string) {
    return this.bomberosService.findAll(estado);
  }

  @Get('exportar/excel')
  @RequirePermission('personal:ver')
  async exportarExcel(@Query('estado') estado: string | undefined, @Res() res: Response) {
    const filas = await this.bomberosService.filasExportables(estado);
    await enviarExportacion(res, 'excel', filas, 'personal', 'Personal - Bomberos');
  }

  @Get('exportar/pdf')
  @RequirePermission('personal:ver')
  async exportarPdf(@Query('estado') estado: string | undefined, @Res() res: Response) {
    const filas = await this.bomberosService.filasExportables(estado);
    await enviarExportacion(res, 'pdf', filas, 'personal', 'Personal - Bomberos');
  }

  @Get(':id')
  @RequirePermission('personal:ver')
  findOne(@Param('id') id: string) {
    return this.bomberosService.findOne(id);
  }

  @Post()
  @RequirePermission('personal:crear')
  create(@Body() dto: CreateBomberoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.bomberosService.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('personal:editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBomberoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.bomberosService.update(id, dto, user.id, req.ip);
  }

  @Patch(':id/baja')
  @RequirePermission('personal:eliminar')
  darBaja(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.bomberosService.darBaja(id, motivo, user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermission('personal:eliminar_fisico')
  eliminarFisico(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.bomberosService.eliminarFisico(id, user.id, req.ip);
  }

  @Put(':id/firma-digital')
  @ApiConsumes('multipart/form-data')
  @RequirePermission('personal:gestionar_firma_digital')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        // Sin SVG a proposito: la firma se dibuja con pdfkit (doc.image())
        // dentro del PDF, que no rasteriza SVG y falla en silencio.
        if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype)) {
          callback(new BadRequestException('La firma debe ser una imagen (png, jpg, webp o gif); SVG no se puede incrustar en el PDF'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  cargarFirmaDigital(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibio ningun archivo');
    }
    return this.bomberosService.cargarFirmaDigital(id, file, user.id, req.ip);
  }

  @Get(':id/firma-digital')
  @RequirePermission('personal:ver')
  async obtenerFirmaDigital(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.bomberosService.obtenerFirmaDigital(id);
    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(buffer);
  }

  @Delete(':id/firma-digital')
  @RequirePermission('personal:gestionar_firma_digital')
  eliminarFirmaDigital(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.bomberosService.eliminarFirmaDigital(id, user.id, req.ip);
  }

  @Patch(':id/autorizacion-firma')
  @RequirePermission('personal:gestionar_firma_digital')
  cambiarAutorizacionFirma(
    @Param('id') id: string,
    @Body() dto: AutorizacionFirmaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.bomberosService.cambiarAutorizacionFirma(id, dto.autorizado, user.id, req.ip);
  }
}
