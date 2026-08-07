import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ActividadProfesionalService } from './actividad-profesional.service';
import { ActividadProfesionalDto } from './dto/actividad-profesional.dto';

@ApiTags('personal/bomberos/actividad-profesional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class ActividadProfesionalController {
  constructor(private readonly service: ActividadProfesionalService) {}

  @Get(':id/actividad-profesional')
  @RequirePermission('personal:ver')
  obtener(@Param('id') id: string) {
    return this.service.obtener(id);
  }

  @Put(':id/actividad-profesional')
  @RequirePermission('personal:editar')
  actualizar(@Param('id') id: string, @Body() dto: ActividadProfesionalDto) {
    return this.service.actualizar(id, dto);
  }
}
