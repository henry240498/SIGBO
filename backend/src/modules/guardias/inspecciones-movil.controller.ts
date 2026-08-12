import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { InspeccionesMovilService } from './inspecciones-movil.service';
import { CreateInspeccionMovilDto } from './dto/create-inspeccion-movil.dto';

@ApiTags('guardias/inspecciones-movil')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/:guardiaId/inspecciones-movil')
export class InspeccionesMovilController {
  constructor(private readonly service: InspeccionesMovilService) {}

  @Get('a-revisar')
  @RequirePermission('guardias:ver')
  movilesARevisar(@Param('guardiaId') guardiaId: string) {
    return this.service.movilesARevisar(guardiaId);
  }

  @Get()
  @RequirePermission('guardias:ver')
  listar(@Param('guardiaId') guardiaId: string) {
    return this.service.listar(guardiaId);
  }

  @Post()
  @RequirePermission('guardias:editar')
  crear(
    @Param('guardiaId') guardiaId: string,
    @Body() dto: CreateInspeccionMovilDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.crear(guardiaId, dto, user.id, req.ip);
  }
}
