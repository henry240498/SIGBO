import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CuotasService } from './cuotas.service';
import { AnularCuotaDto, CreateCuotaDto, PagarCuotaDto } from './dto/cuota.dto';

@ApiTags('finanzas/cuotas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/cuotas')
export class CuotasController {
  constructor(private readonly service: CuotasService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll(@Query('bomberoId') bomberoId?: string, @Query('periodo') periodo?: string, @Query('estado') estado?: string) {
    return this.service.findAll({ bomberoId, periodo, estado });
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('finanzas:crear')
  create(@Body() dto: CreateCuotaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Post(':id/pagar')
  @RequirePermission('finanzas:crear')
  pagar(@Param('id') id: string, @Body() dto: PagarCuotaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.pagar(id, dto, user.id, req.ip);
  }

  @Post(':id/anular')
  @RequirePermission('finanzas:anular')
  anular(@Param('id') id: string, @Body() dto: AnularCuotaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }

  @Post(':id/exonerar')
  @RequirePermission('finanzas:editar')
  exonerar(@Param('id') id: string, @Body() dto: AnularCuotaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.exonerar(id, dto, user.id, req.ip);
  }
}
