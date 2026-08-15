import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PrestamosService } from './prestamos.service';
import { CreatePrestamoDepositoDto, DevolverPrestamoDto } from './dto/prestamo-deposito.dto';

@ApiTags('deposito/prestamos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(@Query('estado') estado?: string, @Query('solicitanteBomberoId') solicitanteBomberoId?: string) {
    return this.service.findAll({ estado, solicitanteBomberoId });
  }

  @Get('vencidos')
  @RequirePermission('deposito:ver')
  vencidos() {
    return this.service.vencidos();
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
  @RequirePermission('deposito:prestar')
  create(@Body() dto: CreatePrestamoDepositoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Post(':id/devolver')
  @RequirePermission('deposito:prestar')
  devolver(@Param('id') id: string, @Body() dto: DevolverPrestamoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.devolver(id, dto, user.id, req.ip);
  }
}
