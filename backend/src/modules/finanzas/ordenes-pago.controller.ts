import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OrdenesPagoService } from './ordenes-pago.service';
import {
  AnularOrdenPagoDto,
  ConVersionDto,
  CreateOrdenPagoDto,
  PagarOrdenPagoDto,
  RechazarOrdenPagoDto,
} from './dto/orden-pago.dto';

@ApiTags('finanzas/ordenes-pago')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/ordenes-pago')
export class OrdenesPagoController {
  constructor(private readonly service: OrdenesPagoService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll(@Query('estado') estado?: string) {
    return this.service.findAll(estado);
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('finanzas:crear')
  create(@Body() dto: CreateOrdenPagoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Post(':id/solicitar')
  @RequirePermission('finanzas:crear')
  solicitar(@Param('id') id: string, @Body() dto: ConVersionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.solicitar(id, dto, user.id, req.ip);
  }

  @Post(':id/enviar-autorizacion')
  @RequirePermission('finanzas:crear')
  enviarAutorizacion(@Param('id') id: string, @Body() dto: ConVersionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.enviarAutorizacion(id, dto, user.id, req.ip);
  }

  @Post(':id/autorizar')
  @RequirePermission('finanzas:autorizar')
  autorizar(@Param('id') id: string, @Body() dto: ConVersionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.autorizar(id, dto, user.id, req.ip);
  }

  @Post(':id/rechazar')
  @RequirePermission('finanzas:autorizar')
  rechazar(@Param('id') id: string, @Body() dto: RechazarOrdenPagoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.rechazar(id, dto, user.id, req.ip);
  }

  @Post(':id/reabrir')
  @RequirePermission('finanzas:crear')
  reabrir(@Param('id') id: string, @Body() dto: ConVersionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.reabrir(id, dto, user.id, req.ip);
  }

  @Post(':id/anular')
  @RequirePermission('finanzas:anular')
  anular(@Param('id') id: string, @Body() dto: AnularOrdenPagoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }

  @Post(':id/pagar')
  @RequirePermission('finanzas:crear')
  pagar(@Param('id') id: string, @Body() dto: PagarOrdenPagoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.pagar(id, dto, user.id, req.ip);
  }
}
