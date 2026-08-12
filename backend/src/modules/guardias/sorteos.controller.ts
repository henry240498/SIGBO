import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SorteosService } from './sorteos.service';
import { CrearGuardiaDesdeSorteoDto, GenerarSorteoDto } from './dto/generar-sorteo.dto';

@ApiTags('guardias/sorteos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/sorteos')
export class SorteosController {
  constructor(private readonly service: SorteosService) {}

  @Get()
  @RequirePermission('guardias:sorteos')
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.findAll(desde, hasta);
  }

  @Get(':id')
  @RequirePermission('guardias:sorteos')
  detalle(@Param('id') id: string) {
    return this.service.detalle(id);
  }

  @Post()
  @RequirePermission('guardias:sorteos')
  generar(@Body() dto: GenerarSorteoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.generar(dto, user.id, req.ip);
  }

  @Post(':id/crear-guardia')
  @RequirePermission('guardias:crear')
  crearGuardia(
    @Param('id') id: string,
    @Body() dto: CrearGuardiaDesdeSorteoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.crearGuardiaDesdeSorteo(id, dto, user.id, req.ip);
  }
}
