import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CentroMandoService } from './centro-mando.service';

/**
 * Accesible para cualquier usuario autenticado, como GET /seguridad/mi-inicio: el estado
 * del bombero, el permiso base de cada seccion y la matriz deciden que se devuelve.
 */
@ApiTags('centro-mando')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('centro-mando')
export class CentroMandoController {
  constructor(private readonly centro: CentroMandoService) {}

  @Get()
  panel(@CurrentUser() user: AuthenticatedUser) {
    return this.centro.panel(user);
  }

  @Get('acceso')
  async acceso(@CurrentUser() user: AuthenticatedUser) {
    const { acceso, motivo } = await this.centro.acceso(user);
    return { acceso, motivo };
  }
}
