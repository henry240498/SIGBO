import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IntegracionFinanzasService } from './integracion-finanzas.service';
import { RegistrarDesdeEntradaDepositoDto } from './dto/integracion-finanzas.dto';

@ApiTags('finanzas/integracion-deposito')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/deposito')
export class IntegracionFinanzasController {
  constructor(private readonly service: IntegracionFinanzasService) {}

  @Get('entradas-sin-registrar')
  @RequirePermission('finanzas:ver')
  entradasSinRegistrar() {
    return this.service.entradasSinRegistrarEnFinanzas();
  }

  @Post('entradas/:entradaId/registrar')
  @RequirePermission('finanzas:crear')
  registrarDesdeEntrada(
    @Param('entradaId') entradaId: string,
    @Body() dto: RegistrarDesdeEntradaDepositoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarDesdeEntradaDeposito(entradaId, dto, user.id, req.ip);
  }
}
