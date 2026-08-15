import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CajasService } from './cajas.service';
import { AbrirCajaDto, CerrarCajaDto, CreateCajaDto, UpdateCajaDto } from './dto/caja.dto';

@ApiTags('finanzas/cajas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/cajas')
export class CajasController {
  constructor(private readonly service: CajasService) {}

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

  @Get(':id/turnos')
  @RequirePermission('finanzas:ver')
  turnos(@Param('id') id: string) {
    return this.service.turnos(id);
  }

  @Get(':id/turno-abierto')
  @RequirePermission('finanzas:ver')
  turnoAbierto(@Param('id') id: string) {
    return this.service.turnoAbierto(id);
  }

  @Post()
  @RequirePermission('finanzas:administrar_cajas')
  create(@Body() dto: CreateCajaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('finanzas:administrar_cajas')
  update(@Param('id') id: string, @Body() dto: UpdateCajaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Post(':id/abrir')
  @RequirePermission('finanzas:cerrar_caja')
  abrir(@Param('id') id: string, @Body() dto: AbrirCajaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.abrir(id, dto, user.id, req.ip);
  }

  @Post(':id/cerrar')
  @RequirePermission('finanzas:cerrar_caja')
  cerrar(@Param('id') id: string, @Body() dto: CerrarCajaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.cerrar(id, dto, user.id, req.ip);
  }
}
