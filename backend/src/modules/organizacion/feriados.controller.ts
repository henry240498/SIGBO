import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { FeriadosService } from './feriados.service';
import { CreateFeriadoDto, MoverFeriadoDto, UpdateFeriadoDto } from './dto/create-feriado.dto';

@ApiTags('organizacion/feriados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('organizacion/feriados')
export class FeriadosController {
  constructor(private readonly service: FeriadosService) {}

  @Get()
  @RequirePermission('organizacion:feriados_ver')
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string, @Query('soloActivos') soloActivos?: string) {
    return this.service.findAll(desde, hasta, soloActivos === 'true');
  }

  @Get(':id')
  @RequirePermission('organizacion:feriados_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('organizacion:feriados_crear')
  create(@Body() dto: CreateFeriadoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('organizacion:feriados_editar')
  update(@Param('id') id: string, @Body() dto: UpdateFeriadoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Post(':id/mover')
  @RequirePermission('organizacion:feriados_editar')
  mover(@Param('id') id: string, @Body() dto: MoverFeriadoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.mover(id, dto, user.id, req.ip);
  }

  @Delete(':id')
  @RequirePermission('organizacion:feriados_eliminar')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.remove(id, user.id, req.ip);
  }
}
