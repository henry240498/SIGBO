import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { HistorialInstitucionalService } from './historial-institucional.service';
import { CrearMovimientoHistorialDto } from './dto/crear-movimiento-historial.dto';

@ApiTags('personal/bomberos/historial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class HistorialInstitucionalController {
  constructor(private readonly service: HistorialInstitucionalService) {}

  @Get(':id/historial')
  @RequirePermission('personal:ver')
  listar(@Param('id') id: string) {
    return this.service.listar(id);
  }

  @Post(':id/historial')
  @RequirePermission('personal:editar')
  registrarManual(
    @Param('id') id: string,
    @Body() dto: CrearMovimientoHistorialDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.registrarManual(id, dto, user.id);
  }
}
