import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { FojaServicioService } from './foja-servicio.service';

@ApiTags('personal/bomberos/foja-servicio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class FojaServicioController {
  constructor(private readonly fojaServicioService: FojaServicioService) {}

  @Post(':id/foja-servicio')
  @RequirePermission('personal:generar_foja')
  generar(
    @Param('id') id: string,
    @Query('anio') anio: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.fojaServicioService.generar(id, user.id, anio ? Number(anio) : undefined);
  }

  @Get(':id/foja-servicio')
  @RequirePermission('personal:ver')
  listarAnios(@Param('id') id: string) {
    return this.fojaServicioService.listarAnios(id);
  }

  @Get(':id/foja-servicio/:anio')
  @RequirePermission('personal:ver')
  obtenerPorAnio(@Param('id') id: string, @Param('anio') anio: string) {
    return this.fojaServicioService.obtenerPorAnio(id, Number(anio));
  }
}
