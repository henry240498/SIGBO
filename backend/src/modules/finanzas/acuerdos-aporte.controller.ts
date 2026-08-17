import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AcuerdosAporteService } from './acuerdos-aporte.service';
import { CreateAcuerdoAporteDto, UpdateAcuerdoAporteDto } from './dto/acuerdo-aporte.dto';

@ApiTags('finanzas/acuerdos-aporte')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/acuerdos-aporte')
export class AcuerdosAporteController {
  constructor(private readonly service: AcuerdosAporteService) {}

  @Get()
  @RequirePermission('finanzas:socios_ver')
  findAll(@Query('socioProtectorId') socioProtectorId?: string, @Query('estado') estado?: string) {
    return this.service.findAll({ socioProtectorId, estado });
  }

  @Post()
  @RequirePermission('finanzas:socios_crear')
  create(@Body() dto: CreateAcuerdoAporteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Get(':id')
  @RequirePermission('finanzas:socios_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @RequirePermission('finanzas:socios_editar')
  update(@Param('id') id: string, @Body() dto: UpdateAcuerdoAporteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }
}
