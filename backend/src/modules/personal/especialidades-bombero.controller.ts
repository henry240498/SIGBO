import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { EspecialidadesBomberoService } from './especialidades-bombero.service';
import { SetEspecialidadesDto } from './dto/set-especialidades.dto';

@ApiTags('personal/bomberos/especialidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class EspecialidadesBomberoController {
  constructor(private readonly service: EspecialidadesBomberoService) {}

  @Get(':id/especialidades')
  @RequirePermission('personal:ver')
  listar(@Param('id') id: string) {
    return this.service.listar(id);
  }

  @Put(':id/especialidades')
  @RequirePermission('personal:editar')
  reemplazar(@Param('id') id: string, @Body() dto: SetEspecialidadesDto) {
    return this.service.reemplazar(id, dto.especialidades);
  }
}
