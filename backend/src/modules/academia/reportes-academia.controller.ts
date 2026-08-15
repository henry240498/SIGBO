import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ReportesAcademiaService } from './reportes-academia.service';

@ApiTags('academia/reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/actividades')
export class ReportesAcademiaController {
  constructor(private readonly service: ReportesAcademiaService) {}

  @Get(':id/reporte.pdf')
  @RequirePermission('academia:ver')
  async pdf(@Param('id') id: string, @Query('cargoFirmanteId') cargoFirmanteId?: string) {
    return { url: await this.service.generarPdf(id, cargoFirmanteId) };
  }

  @Get(':id/reporte.docx')
  @RequirePermission('academia:ver')
  async docx(@Param('id') id: string, @Query('cargoFirmanteId') cargoFirmanteId?: string) {
    return { url: await this.service.generarDocx(id, cargoFirmanteId) };
  }
}
