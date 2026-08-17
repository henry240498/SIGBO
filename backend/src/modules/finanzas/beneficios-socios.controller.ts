import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { BeneficiosSociosService } from './beneficios-socios.service';
import { CreateBeneficioSocioDto, UpdateBeneficioSocioDto } from './dto/beneficio-socio.dto';
import { SimularBeneficioDto } from './dto/simular-beneficio.dto';

@ApiTags('finanzas/beneficios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/beneficios')
export class BeneficiosSociosController {
  constructor(private readonly service: BeneficiosSociosService) {}

  @Get()
  @RequirePermission('finanzas:socios_ver')
  findAll(@Query('estado') estado?: string, @Query('ambito') ambito?: string) {
    return this.service.findAll({ estado, ambito });
  }

  @Post()
  @RequirePermission('finanzas:beneficios_administrar')
  create(@Body() dto: CreateBeneficioSocioDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Post('simular')
  @RequirePermission('finanzas:socios_ver')
  simular(@Body() dto: SimularBeneficioDto) {
    return this.service.simular(dto.socioProtectorId, dto.ambito as any, dto.montoBase, dto.referenciaId);
  }

  @Get(':id')
  @RequirePermission('finanzas:socios_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @RequirePermission('finanzas:beneficios_administrar')
  update(@Param('id') id: string, @Body() dto: UpdateBeneficioSocioDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }
}
