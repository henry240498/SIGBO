import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { AuditoriaService } from './auditoria.service';

@ApiTags('seguridad/auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('seguridad/auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @RequirePermission('seguridad:ver_logs')
  findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('recurso') recurso?: string,
    @Query('recursoPrefijo') recursoPrefijo?: string,
    @Query('recursoId') recursoId?: string,
    @Query('accion') accion?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditoriaService.findAll({
      usuarioId,
      recurso,
      recursoPrefijo,
      recursoId,
      accion,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }
}
