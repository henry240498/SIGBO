import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { EquipamientoBomberoService } from './equipamiento-bombero.service';
import { CrearPrestamoDto, DevolucionDto } from './dto/prestamo-equipo-bombero.dto';

@ApiTags('personal/bomberos/equipamiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class EquipamientoBomberoController {
  constructor(private readonly service: EquipamientoBomberoService) {}

  @Get(':id/equipamiento')
  @RequirePermission('personal:ver')
  historial(@Param('id') id: string) {
    return this.service.historial(id);
  }

  @Post(':id/equipamiento')
  @RequirePermission('equipos:prestar')
  prestar(
    @Param('id') id: string,
    @Body() dto: CrearPrestamoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.prestar(id, dto, user.id);
  }

  @Patch('equipamiento/:prestamoId/devolucion')
  @RequirePermission('equipos:prestar')
  devolver(@Param('prestamoId') prestamoId: string, @Body() dto: DevolucionDto) {
    return this.service.devolver(prestamoId, dto);
  }
}
