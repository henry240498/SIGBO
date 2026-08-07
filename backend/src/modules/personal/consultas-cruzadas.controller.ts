import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ConsultasCruzadasService } from './consultas-cruzadas.service';

@ApiTags('personal/bomberos/consultas-cruzadas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class ConsultasCruzadasController {
  constructor(private readonly service: ConsultasCruzadasService) {}

  @Get(':id/guardias')
  @RequirePermission('personal:ver')
  guardias(@Param('id') id: string) {
    return this.service.guardiasDeBombero(id);
  }

  @Get(':id/servicios')
  @RequirePermission('personal:ver')
  servicios(@Param('id') id: string) {
    return this.service.serviciosDeBombero(id);
  }

  @Get(':id/formacion-academia')
  @RequirePermission('personal:ver')
  formacionAcademia(@Param('id') id: string) {
    return this.service.formacionAcademicaDeBombero(id);
  }
}
