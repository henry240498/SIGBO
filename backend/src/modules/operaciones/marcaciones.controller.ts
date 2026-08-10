import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MarcacionesService } from './marcaciones.service';
import { RegistrarMarcacionDto } from './dto/registrar-marcacion.dto';
import { EventosAsistenciaService } from './eventos-asistencia.service';

@ApiTags('operaciones/marcaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('operaciones/marcaciones')
export class MarcacionesController {
  constructor(
    private readonly service: MarcacionesService,
    private readonly eventosService: EventosAsistenciaService,
  ) {}

  @Post()
  @RequirePermission('asistencia:asistencia_crear')
  registrar(@Body() dto: RegistrarMarcacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.registrarManual(dto, user.id, req.ip);
  }

  @Get()
  @RequirePermission('asistencia:asistencia_ver')
  buscar(
    @Query('bomberoId') bomberoId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('fuente') fuente?: string,
    @Query('tipoMarcacion') tipoMarcacion?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.buscar({
      bomberoId,
      desde,
      hasta,
      fuente,
      tipoMarcacion,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('bombero/:bomberoId')
  @RequirePermission('asistencia:asistencia_ver')
  listarPorBombero(
    @Param('bomberoId') bomberoId: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.listarPorBombero(bomberoId, desde, hasta);
  }

  @Get('dia/:fecha')
  @RequirePermission('asistencia:asistencia_ver')
  listarDelDia(@Param('fecha') fecha: string) {
    return this.service.listarDelDia(fecha);
  }

  @Get('solapamiento/:eventoId/:bomberoId')
  @RequirePermission('asistencia:asistencia_ver')
  calcularSolapamiento(@Param('eventoId') eventoId: string, @Param('bomberoId') bomberoId: string) {
    return this.eventosService.calcularSolapamientoMarcaciones(eventoId, bomberoId);
  }
}
