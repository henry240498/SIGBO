import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { EjerciciosFiscalesService } from './ejercicios-fiscales.service';
import { CreateEjercicioFiscalDto } from './dto/ejercicio-fiscal.dto';

@ApiTags('finanzas/ejercicios-fiscales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/ejercicios-fiscales')
export class EjerciciosFiscalesController {
  constructor(private readonly service: EjerciciosFiscalesService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('finanzas:administrar_presupuesto')
  create(@Body() dto: CreateEjercicioFiscalDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id/cerrar')
  @RequirePermission('finanzas:administrar_presupuesto')
  cerrar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.cerrar(id, user.id, req.ip);
  }

  @Patch(':id/reabrir')
  @RequirePermission('finanzas:administrar_presupuesto')
  reabrir(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.reabrir(id, user.id, req.ip);
  }
}
