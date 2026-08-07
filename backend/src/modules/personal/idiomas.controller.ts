import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { IdiomasService } from './idiomas.service';
import { SetIdiomasDto } from './dto/idioma.dto';

@ApiTags('personal/bomberos/idiomas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class IdiomasController {
  constructor(private readonly service: IdiomasService) {}

  @Get(':id/idiomas')
  @RequirePermission('personal:ver')
  listar(@Param('id') id: string) {
    return this.service.listar(id);
  }

  @Put(':id/idiomas')
  @RequirePermission('personal:editar')
  reemplazar(@Param('id') id: string, @Body() dto: SetIdiomasDto) {
    return this.service.reemplazar(id, dto.idiomas);
  }
}
