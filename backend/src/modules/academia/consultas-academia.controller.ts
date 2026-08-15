import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ConsultasAcademiaService } from './consultas-academia.service';

/** Endpoints de solo lectura pensados para consumo automatizado (Snoopy IA,
 * a futuro) ademas de uso directo desde el frontend. Todos requieren
 * academia:ver -- una IA que consulte en nombre de un usuario hereda
 * exactamente los mismos permisos de ese usuario, nunca mas. */
@ApiTags('academia/consultas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/consultas')
export class ConsultasAcademiaController {
  constructor(private readonly service: ConsultasAcademiaService) {}

  @Get('formacion-bombero/:bomberoId')
  @RequirePermission('academia:ver')
  formacionBombero(@Param('bomberoId') bomberoId: string) {
    return this.service.formacionCompletaDeBombero(bomberoId);
  }

  @Get('actividades-vigentes')
  @RequirePermission('academia:ver')
  actividadesVigentes() {
    return this.service.actividadesVigentes();
  }

  @Get('resumen-institucional')
  @RequirePermission('academia:ver')
  resumenInstitucional() {
    return this.service.resumenInstitucional();
  }
}
