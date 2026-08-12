import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { BitacoraService } from './bitacora.service';
import { CerrarGuardiaDto, ReabrirGuardiaDto } from './dto/cerrar-guardia.dto';

@ApiTags('guardias/bitacora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/:guardiaId')
export class BitacoraController {
  constructor(private readonly service: BitacoraService) {}

  @Get('bitacora')
  @RequirePermission('guardias:ver')
  obtener(@Param('guardiaId') guardiaId: string) {
    return this.service.obtener(guardiaId);
  }

  @Post('cerrar')
  @RequirePermission('guardias:editar')
  cerrar(
    @Param('guardiaId') guardiaId: string,
    @Body() dto: CerrarGuardiaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.cerrar(guardiaId, dto.observacion, dto.responsableId, user.id, req.ip);
  }

  @Post('reabrir')
  @RequirePermission('guardias:editar')
  reabrir(
    @Param('guardiaId') guardiaId: string,
    @Body() dto: ReabrirGuardiaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.reabrir(guardiaId, dto.motivo, user.id, req.ip);
  }
}
