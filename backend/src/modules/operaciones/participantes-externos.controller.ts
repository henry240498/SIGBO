import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ParticipantesExternosService } from './participantes-externos.service';
import { ParticipanteExternoDto } from './dto/participante-externo.dto';

@ApiTags('operaciones/participantes-externos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/externos')
export class ParticipantesExternosController {
  constructor(private readonly service: ParticipantesExternosService) {}

  @Get()
  @RequirePermission('asistencia:externos_ver')
  findAll(@Query('q') q?: string) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @RequirePermission('asistencia:externos_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('asistencia:externos_crear')
  create(@Body() dto: ParticipanteExternoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('asistencia:externos_editar')
  update(@Param('id') id: string, @Body() dto: Partial<ParticipanteExternoDto>) {
    return this.service.update(id, dto);
  }
}
