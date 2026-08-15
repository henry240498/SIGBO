import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { EntradasService } from './entradas.service';
import { CreateEntradaDepositoDto } from './dto/entrada-deposito.dto';

@ApiTags('deposito/entradas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/entradas')
export class EntradasController {
  constructor(private readonly service: EntradasService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(
    @Query('proveedorId') proveedorId?: string,
    @Query('tipoEntradaId') tipoEntradaId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ proveedorId, tipoEntradaId, desde, hasta });
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/items')
  @RequirePermission('deposito:ver')
  items(@Param('id') id: string) {
    return this.service.items(id);
  }

  @Post()
  @RequirePermission('deposito:crear')
  create(@Body() dto: CreateEntradaDepositoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }
}
