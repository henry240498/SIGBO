import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SociosProtectoresService } from './socios-protectores.service';
import { CreateSocioProtectorDto, UpdateSocioProtectorDto } from './dto/socio-protector.dto';

@ApiTags('finanzas/socios-protectores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/socios-protectores')
export class SociosProtectoresController {
  constructor(private readonly service: SociosProtectoresService) {}

  @Get()
  @RequirePermission('finanzas:socios_ver')
  findAll(@Query('estadoId') estadoId?: string, @Query('tipoPersona') tipoPersona?: string, @Query('q') q?: string) {
    return this.service.findAll({ estadoId, tipoPersona, q });
  }

  @Post()
  @RequirePermission('finanzas:socios_crear')
  create(@Body() dto: CreateSocioProtectorDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Get(':id')
  @RequirePermission('finanzas:socios_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @RequirePermission('finanzas:socios_editar')
  update(@Param('id') id: string, @Body() dto: UpdateSocioProtectorDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Get(':id/historial-codigo')
  @RequirePermission('finanzas:socios_ver')
  historialCodigo(@Param('id') id: string) {
    return this.service.historialCodigo(id);
  }

  @Get(':id/estado-de-cuenta')
  @RequirePermission('finanzas:socios_ver')
  estadoDeCuenta(@Param('id') id: string) {
    return this.service.estadoDeCuenta(id);
  }
}
