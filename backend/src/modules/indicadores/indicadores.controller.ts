import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { IndicadoresService } from './indicadores.service';

/** Indicadores operativos del cuartel. Solo lectura: reutiliza servicios:ver. */
@ApiTags('indicadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly indicadores: IndicadoresService) {}

  private rango(desde?: string, hasta?: string) {
    if (!desde || !hasta) throw new BadRequestException('Indique desde y hasta (AAAA-MM-DD).');
    return { desde, hasta };
  }

  @Get('operativos')
  @RequirePermission('servicios:ver')
  operativos(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    const r = this.rango(desde, hasta);
    return this.indicadores.operativos(r.desde, r.hasta);
  }

  @Get('calor')
  @RequirePermission('servicios:ver')
  calor(@Query('desde') desde?: string, @Query('hasta') hasta?: string, @Query('celda') celda?: string) {
    const r = this.rango(desde, hasta);
    const m = Number(celda);
    return this.indicadores.calor(r.desde, r.hasta, Number.isFinite(m) && m > 0 ? m : 500);
  }
}
