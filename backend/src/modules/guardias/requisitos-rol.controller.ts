import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequisitosRolService } from './requisitos-rol.service';
import { CreateRequisitoRolDto } from './dto/create-requisito-rol.dto';
import { ToggleActivoDto } from './dto/toggle-activo.dto';

@ApiTags('guardias/requisitos-rol')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/requisitos-rol')
export class RequisitosRolController {
  constructor(private readonly service: RequisitosRolService) {}

  @Get()
  @RequirePermission('guardias:requisitos')
  findAll(@Query('rol') rol?: string) {
    return this.service.findAll(rol);
  }

  @Post()
  @RequirePermission('guardias:requisitos')
  create(@Body() dto: CreateRequisitoRolDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id/activo')
  @RequirePermission('guardias:requisitos')
  toggleActivo(@Param('id') id: string, @Body() dto: ToggleActivoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.toggleActivo(id, dto.activo, user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermission('guardias:requisitos')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.remove(id, user.id, req.ip);
  }
}
