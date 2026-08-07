import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CondicionService } from './condicion.service';
import { ActualizarCondicionDto } from './dto/actualizar-condicion.dto';

@ApiTags('personal/bomberos/condicion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class CondicionController {
  constructor(private readonly service: CondicionService) {}

  @Get(':id/condicion')
  @RequirePermission('personal:ver')
  obtener(@Param('id') id: string) {
    return this.service.obtener(id);
  }

  @Put(':id/condicion')
  @RequirePermission('personal:editar')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarCondicionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.actualizar(id, dto, user.id);
  }
}
