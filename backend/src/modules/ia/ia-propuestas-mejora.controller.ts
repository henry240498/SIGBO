import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IaPropuestasMejoraService } from './ia-propuestas-mejora.service';
import { CreatePropuestaMejoraDto, DecidirPropuestaMejoraDto } from './dto/propuesta-mejora.dto';

@ApiTags('ia/admin/propuestas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia/admin/propuestas')
export class IaPropuestasMejoraController {
  constructor(private readonly service: IaPropuestasMejoraService) {}

  @Get()
  @RequirePermission('inteligencia:gestionar_mejoras')
  findAll(@Query('estado') estado?: string) {
    return this.service.findAll(estado);
  }

  @Get(':id')
  @RequirePermission('inteligencia:gestionar_mejoras')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('inteligencia:gestionar_mejoras')
  crear(@Body() dto: CreatePropuestaMejoraDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.crear(dto, user.id, req.ip ?? null);
  }

  @Post(':id/enviar-revision')
  @RequirePermission('inteligencia:gestionar_mejoras')
  enviarARevision(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.enviarARevision(id, user.id, req.ip ?? null);
  }

  @Post(':id/aprobar')
  @RequirePermission('inteligencia:gestionar_mejoras')
  aprobar(@Param('id') id: string, @Body() dto: DecidirPropuestaMejoraDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.aprobar(id, dto, user.id, req.ip ?? null);
  }

  @Post(':id/rechazar')
  @RequirePermission('inteligencia:gestionar_mejoras')
  rechazar(@Param('id') id: string, @Body() dto: DecidirPropuestaMejoraDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.rechazar(id, dto, user.id, req.ip ?? null);
  }

  @Post(':id/publicar')
  @RequirePermission('inteligencia:gestionar_mejoras')
  publicar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.publicar(id, user.id, req.ip ?? null);
  }
}
