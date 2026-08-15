import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { ConsultasDocumentosService } from './consultas-documentos.service';

@ApiTags('documentos/consultas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos/consultas')
export class ConsultasDocumentosController {
  constructor(private readonly service: ConsultasDocumentosService) {}

  @Get('buscar')
  @RequirePermission('documentos:ver')
  buscar(@Query('q') q: string) {
    return this.service.buscar(q);
  }

  @Get('proximos-a-vencer')
  @RequirePermission('documentos:ver')
  proximosAVencer(@Query('dias') dias?: string) {
    return this.service.proximosAVencer(dias ? Number(dias) : undefined);
  }
}
