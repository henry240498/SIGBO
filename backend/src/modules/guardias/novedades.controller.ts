import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NovedadesService } from './novedades.service';
import { CreateNovedadDto } from './dto/create-novedad.dto';

@ApiTags('guardias/novedades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/:guardiaId/novedades')
export class NovedadesController {
  constructor(private readonly service: NovedadesService) {}

  @Get()
  @RequirePermission('guardias:ver')
  listar(@Param('guardiaId') guardiaId: string) {
    return this.service.listar(guardiaId);
  }

  @Post()
  @RequirePermission('guardias:editar')
  crear(
    @Param('guardiaId') guardiaId: string,
    @Body() dto: CreateNovedadDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.crear(guardiaId, dto, user.id, req.ip);
  }
}
