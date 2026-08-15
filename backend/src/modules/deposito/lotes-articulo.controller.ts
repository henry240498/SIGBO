import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { LotesArticuloService } from './lotes-articulo.service';
import { CreateLoteArticuloDto } from './dto/lote-articulo.dto';

@ApiTags('deposito/lotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/lotes')
export class LotesArticuloController {
  constructor(private readonly service: LotesArticuloService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(@Query('articuloId') articuloId?: string, @Query('estado') estado?: string) {
    return this.service.findAll(articuloId, estado);
  }

  @Get('proximos-a-vencer')
  @RequirePermission('deposito:ver')
  proximosAVencer(@Query('dias') dias?: string) {
    return this.service.proximosAVencer(dias ? Number(dias) : undefined);
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('deposito:crear')
  create(@Body() dto: CreateLoteArticuloDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }
}
