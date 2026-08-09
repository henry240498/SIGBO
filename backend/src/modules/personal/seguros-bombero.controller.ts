import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SegurosBomberoService } from './seguros-bombero.service';
import { CreateSeguroBomberoDto } from './dto/create-seguro-bombero.dto';
import { UpdateSeguroBomberoDto } from './dto/update-seguro-bombero.dto';

@ApiTags('personal/bomberos/seguros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class SegurosBomberoController {
  constructor(private readonly service: SegurosBomberoService) {}

  @Get(':id/seguros')
  @RequirePermission('personal:seguros_ver')
  listar(@Param('id') id: string) {
    return this.service.listar(id);
  }

  @Post(':id/seguros')
  @RequirePermission('personal:seguros_crear')
  crear(@Param('id') id: string, @Body() dto: CreateSeguroBomberoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.crear(id, dto, user.id);
  }

  @Patch(':id/seguros/:seguroId')
  @RequirePermission('personal:seguros_editar')
  actualizar(@Param('id') id: string, @Param('seguroId') seguroId: string, @Body() dto: UpdateSeguroBomberoDto) {
    return this.service.actualizar(id, seguroId, dto);
  }

  @Patch(':id/seguros/:seguroId/baja')
  @RequirePermission('personal:seguros_eliminar')
  darBaja(@Param('id') id: string, @Param('seguroId') seguroId: string) {
    return this.service.darBaja(id, seguroId);
  }
}
