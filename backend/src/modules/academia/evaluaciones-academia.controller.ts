import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { EvaluacionesAcademiaService } from './evaluaciones-academia.service';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { RegistrarNotaDto } from './dto/registrar-nota.dto';

@ApiTags('academia/evaluaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia')
export class EvaluacionesAcademiaController {
  constructor(private readonly service: EvaluacionesAcademiaService) {}

  @Get('actividades/:id/evaluaciones')
  @RequirePermission('academia:ver')
  listar(@Param('id') id: string) {
    return this.service.listarEvaluaciones(id);
  }

  @Post('actividades/:id/evaluaciones')
  @RequirePermission('academia:calificar')
  crear(
    @Param('id') id: string,
    @Body() dto: CrearEvaluacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.crearEvaluacion(id, dto, user.id, req.ip);
  }

  @Get('evaluaciones/:evaluacionId/notas')
  @RequirePermission('academia:ver')
  listarNotas(@Param('evaluacionId') evaluacionId: string) {
    return this.service.listarNotas(evaluacionId);
  }

  @Put('evaluaciones/:evaluacionId/notas/:inscripcionId')
  @RequirePermission('academia:calificar')
  registrarNota(
    @Param('evaluacionId') evaluacionId: string,
    @Param('inscripcionId') inscripcionId: string,
    @Body() dto: RegistrarNotaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarNota(evaluacionId, inscripcionId, dto, user.id, req.ip);
  }
}
