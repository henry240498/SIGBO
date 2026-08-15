import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PresupuestosService } from './presupuestos.service';
import { CreatePresupuestoDto, UpdatePresupuestoDto } from './dto/presupuesto.dto';

@ApiTags('finanzas/presupuestos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/presupuestos')
export class PresupuestosController {
  constructor(private readonly service: PresupuestosService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll(@Query('ejercicioId') ejercicioId: string) {
    return this.service.findAll(ejercicioId);
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('finanzas:administrar_presupuesto')
  create(@Body() dto: CreatePresupuestoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('finanzas:administrar_presupuesto')
  update(@Param('id') id: string, @Body() dto: UpdatePresupuestoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }
}
