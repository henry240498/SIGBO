import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { FirmasDocumentoService } from './firmas-documento.service';
import { ConfirmarFirmaManualDto, DefinirFirmantesDto } from './dto/firma-documento.dto';

@ApiTags('documentos/firmas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos')
export class FirmasDocumentoController {
  constructor(private readonly service: FirmasDocumentoService) {}

  @Get(':documentoId/firmas')
  @RequirePermission('documentos:ver')
  porDocumento(@Param('documentoId') documentoId: string) {
    return this.service.porDocumento(documentoId);
  }

  @Post(':documentoId/firmas')
  @RequirePermission('documentos:administrar')
  definirFirmantes(@Param('documentoId') documentoId: string, @Body() dto: DefinirFirmantesDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.definirFirmantes(documentoId, dto, user.id, req.ip);
  }

  @Post('firmas/:firmaId/firmar')
  @RequirePermission('documentos:firmar')
  firmarAutomatico(@Param('firmaId') firmaId: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.firmarAutomatico(firmaId, user.id, req.ip);
  }

  @Post('firmas/:firmaId/confirmar-manual')
  @RequirePermission('documentos:firmar')
  confirmarManual(@Param('firmaId') firmaId: string, @Body() dto: ConfirmarFirmaManualDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.confirmarManual(firmaId, dto, user.id, req.ip);
  }
}
