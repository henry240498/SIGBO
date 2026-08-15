import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ExpedientesService } from './expedientes.service';
import { CreateExpedienteDto, UpdateExpedienteDto } from './dto/expediente.dto';

@ApiTags('documentos/expedientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos/expedientes')
export class ExpedientesController {
  constructor(private readonly service: ExpedientesService) {}

  @Get()
  @RequirePermission('documentos:ver')
  findAll(@Query('estado') estado?: string) {
    return this.service.findAll(estado);
  }

  @Get(':id')
  @RequirePermission('documentos:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/documentos')
  @RequirePermission('documentos:ver')
  documentos(@Param('id') id: string) {
    return this.service.documentos(id);
  }

  @Post()
  @RequirePermission('documentos:crear')
  create(@Body() dto: CreateExpedienteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('documentos:editar')
  update(@Param('id') id: string, @Body() dto: UpdateExpedienteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }
}
