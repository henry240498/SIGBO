import { BadRequestException, Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { FojaServicioService } from './foja-servicio.service';
import { Response } from 'express';

@ApiTags('personal/bomberos/foja-servicio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class FojaServicioController {
  constructor(private readonly fojaServicioService: FojaServicioService) {}

  @Post(':id/foja-servicio')
  @RequirePermission('personal:generar_foja')
  generar(
    @Param('id') id: string,
    @Query('anio') anio: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.fojaServicioService.generar(id, user.id, anio ? Number(anio) : undefined);
  }

  @Get(':id/foja-servicio')
  @RequirePermission('personal:ver')
  listarAnios(@Param('id') id: string) {
    return this.fojaServicioService.listarAnios(id);
  }

  @Get(':id/foja-servicio/:anio')
  @RequirePermission('personal:ver')
  obtenerPorAnio(@Param('id') id: string, @Param('anio') anio: string) {
    return this.fojaServicioService.obtenerPorAnio(id, Number(anio));
  }

  @Get(':id/foja-servicio/:anio/archivos/:formato')
  @RequirePermission('personal:ver')
  async descargarArchivo(
    @Param('id') id: string,
    @Param('anio') anio: string,
    @Param('formato') formato: string,
    @Res() res: Response,
  ) {
    if (formato !== 'pdf' && formato !== 'docx') throw new BadRequestException('Formato de archivo no válido');
    const buffer = await this.fojaServicioService.descargarArchivo(id, Number(anio), formato);
    res.set({
      'Content-Type': formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `attachment; filename="foja-servicio-${anio}.${formato}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(buffer);
  }
}
