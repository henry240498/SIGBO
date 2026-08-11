import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { InspeccionesEstacionService } from './inspecciones-estacion.service';
import { CreateInspeccionEstacionDto } from './dto/create-inspeccion-estacion.dto';

@ApiTags('guardias/inspecciones-estacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/:guardiaId/inspecciones-estacion')
export class InspeccionesEstacionController {
  constructor(private readonly service: InspeccionesEstacionService) {}

  @Get()
  @RequirePermission('guardias:ver')
  listar(@Param('guardiaId') guardiaId: string) {
    return this.service.listar(guardiaId);
  }

  @Post()
  @RequirePermission('guardias:editar')
  crear(
    @Param('guardiaId') guardiaId: string,
    @Body() dto: CreateInspeccionEstacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.crear(guardiaId, dto, user.id, req.ip);
  }
}
