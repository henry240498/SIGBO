import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CursosExternosService, URL_LOGIN_OBA } from './cursos-externos.service';

@ApiTags('academia/cursos-externos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/cursos-externos')
export class CursosExternosController {
  constructor(private readonly service: CursosExternosService) {}

  @Get()
  @RequirePermission('academia:ver')
  async listar() {
    return { urlLogin: URL_LOGIN_OBA, cursos: await this.service.listar() };
  }

  @Post('refrescar')
  @RequirePermission('academia:configurar')
  refrescar() {
    return this.service.refrescar();
  }
}
