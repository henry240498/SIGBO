import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { InscripcionesAcademiaService } from './inscripciones-academia.service';
import { InscribirParticipanteDto } from './dto/inscribir-participante.dto';
import { ActualizarInscripcionDto } from './dto/actualizar-inscripcion.dto';

@ApiTags('academia/inscripciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/actividades')
export class InscripcionesAcademiaController {
  constructor(private readonly service: InscripcionesAcademiaService) {}

  @Get(':id/participantes')
  @RequirePermission('academia:ver')
  listar(@Param('id') id: string) {
    return this.service.listarParticipantes(id);
  }

  @Post(':id/participantes')
  @RequirePermission('academia:inscribir')
  inscribir(
    @Param('id') id: string,
    @Body() dto: InscribirParticipanteDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.inscribir(id, dto, user.id, req.ip);
  }

  @Patch(':id/participantes/:inscripcionId')
  @RequirePermission('academia:calificar')
  actualizar(
    @Param('id') id: string,
    @Param('inscripcionId') inscripcionId: string,
    @Body() dto: ActualizarInscripcionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.actualizar(id, inscripcionId, dto, user.id, req.ip);
  }

  @Delete(':id/participantes/:inscripcionId')
  @RequirePermission('academia:inscribir')
  quitar(
    @Param('id') id: string,
    @Param('inscripcionId') inscripcionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitar(id, inscripcionId, user.id, req.ip);
  }
}
