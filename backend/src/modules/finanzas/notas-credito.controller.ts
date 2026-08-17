import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NotasCreditoService } from './notas-credito.service';
import { CreateNotaCreditoDto } from './dto/factura.dto';

@ApiTags('finanzas/notas-credito')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/notas-credito')
export class NotasCreditoController {
  constructor(private readonly service: NotasCreditoService) {}

  @Get()
  @RequirePermission('finanzas:facturacion_ver')
  findAll(@Query('facturaId') facturaId?: string) {
    return this.service.findAll({ facturaId });
  }

  @Post()
  @RequirePermission('finanzas:notas_credito_crear')
  create(@Body() dto: CreateNotaCreditoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Get(':id')
  @RequirePermission('finanzas:facturacion_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
