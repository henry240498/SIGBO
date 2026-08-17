import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NumeracionesComprobantesService } from './numeraciones-comprobantes.service';
import { CreateNumeracionComprobanteDto } from './dto/numeracion-comprobante.dto';

@ApiTags('finanzas/numeraciones-comprobantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/numeraciones-comprobantes')
export class NumeracionesComprobantesController {
  constructor(private readonly service: NumeracionesComprobantesService) {}

  @Get()
  @RequirePermission('finanzas:facturacion_ver')
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermission('finanzas:facturacion_crear')
  create(@Body() dto: CreateNumeracionComprobanteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Get(':id')
  @RequirePermission('finanzas:facturacion_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
