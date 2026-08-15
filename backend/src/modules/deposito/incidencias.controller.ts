import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IncidenciasService } from './incidencias.service';
import { CreateIncidenciaDepositoDto, ResolverIncidenciaDto } from './dto/incidencia-deposito.dto';

@ApiTags('deposito/incidencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/incidencias')
export class IncidenciasController {
  constructor(private readonly service: IncidenciasService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(@Query('estado') estado?: string, @Query('origenTipo') origenTipo?: string, @Query('gravedad') gravedad?: string) {
    return this.service.findAll({ estado, origenTipo, gravedad });
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('deposito:crear')
  create(@Body() dto: CreateIncidenciaDepositoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id/resolver')
  @RequirePermission('deposito:editar')
  resolver(@Param('id') id: string, @Body() dto: ResolverIncidenciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.resolver(id, dto, user.id, req.ip);
  }
}
