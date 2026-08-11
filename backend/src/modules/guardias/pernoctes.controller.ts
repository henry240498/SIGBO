import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PernoctesService } from './pernoctes.service';
import { CreatePernocteDto } from './dto/create-pernocte.dto';
import { RegistrarSalidaPernocteDto } from './dto/registrar-salida-pernocte.dto';

@ApiTags('guardias/pernoctes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/pernoctes')
export class PernoctesController {
  constructor(private readonly service: PernoctesService) {}

  @Get()
  @RequirePermission('guardias:ver')
  listar(@Query('fecha') fecha?: string, @Query('guardiaId') guardiaId?: string) {
    return this.service.listar(fecha, guardiaId);
  }

  @Post()
  @RequirePermission('guardias:editar')
  crear(@Body() dto: CreatePernocteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.crear(dto, user.id, req.ip);
  }

  @Patch(':id/salida')
  @RequirePermission('guardias:editar')
  registrarSalida(
    @Param('id') id: string,
    @Body() dto: RegistrarSalidaPernocteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarSalida(id, dto.horaSalida, user.id, req.ip);
  }
}
