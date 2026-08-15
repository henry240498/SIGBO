import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { ReportesFinanzasService } from './reportes-finanzas.service';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { PresupuestosService } from './presupuestos.service';

@ApiTags('finanzas/reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/reportes')
export class ReportesFinanzasController {
  constructor(
    private readonly service: ReportesFinanzasService,
    private readonly movimientosService: MovimientosFinancierosService,
    private readonly presupuestosService: PresupuestosService,
  ) {}

  @Get('movimientos/:id/comprobante.pdf')
  @RequirePermission('finanzas:reportes')
  async comprobante(@Param('id') id: string, @Query('cargoFirmanteId') cargoFirmanteId?: string) {
    const url = await this.service.generarComprobantePdf(id, cargoFirmanteId);
    return { url };
  }

  @Get('movimientos/exportar/excel')
  @RequirePermission('finanzas:reportes')
  async exportarMovimientosExcel(
    @Res() res: Response,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const filas = await this.movimientosService.filasExportables({ tipo, estado, desde, hasta });
    await enviarExportacion(res, 'excel', filas, 'movimientos-financieros', 'Movimientos Financieros');
  }

  @Get('movimientos/exportar/pdf')
  @RequirePermission('finanzas:reportes')
  async exportarMovimientosPdf(
    @Res() res: Response,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const filas = await this.movimientosService.filasExportables({ tipo, estado, desde, hasta });
    await enviarExportacion(res, 'pdf', filas, 'movimientos-financieros', 'Movimientos Financieros');
  }

  @Get('presupuestos/exportar/excel')
  @RequirePermission('finanzas:reportes')
  async exportarPresupuestoExcel(@Res() res: Response, @Query('ejercicioId') ejercicioId: string) {
    const presupuestos = await this.presupuestosService.findAll(ejercicioId);
    const filas = presupuestos.map((p) => ({
      Presupuestado: p.montoPresupuestado,
      Ejecutado: p.ejecutado,
      Disponible: p.disponible,
      '% Ejecutado': p.porcentajeEjecutado,
    }));
    await enviarExportacion(res, 'excel', filas, 'presupuesto', 'Presupuesto');
  }
}
