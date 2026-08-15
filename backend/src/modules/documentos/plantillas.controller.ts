import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PlantillasService } from './plantillas.service';
import { CreatePlantillaDto, GenerarDesdePlantillaDto, UpdatePlantillaDto } from './dto/plantilla.dto';

@ApiTags('documentos/plantillas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documentos/plantillas')
export class PlantillasController {
  constructor(private readonly service: PlantillasService) {}

  @Get()
  @RequirePermission('documentos:ver')
  findAll(@Query('activa') activa?: string) {
    return this.service.findAll(activa);
  }

  @Get(':id')
  @RequirePermission('documentos:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('documentos:administrar')
  create(@Body() dto: CreatePlantillaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('documentos:administrar')
  update(@Param('id') id: string, @Body() dto: UpdatePlantillaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Post(':id/generar')
  @RequirePermission('documentos:crear')
  generar(@Param('id') id: string, @Body() dto: GenerarDesdePlantillaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.generar(id, dto, user.id, req.ip);
  }
}
