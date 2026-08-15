import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto, UpdateArticuloDto } from './dto/articulo.dto';

@ApiTags('deposito/articulos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/articulos')
export class ArticulosController {
  constructor(private readonly service: ArticulosService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(
    @Query('q') q?: string,
    @Query('categoriaArticuloId') categoriaArticuloId?: string,
    @Query('estado') estado?: string,
    @Query('stockBajo') stockBajo?: string,
  ) {
    return this.service.findAll({ q, categoriaArticuloId, estado, stockBajo });
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/tenencias')
  @RequirePermission('deposito:ver')
  tenencias(@Param('id') id: string) {
    return this.service.tenencias(id);
  }

  @Post()
  @RequirePermission('deposito:crear')
  create(@Body() dto: CreateArticuloDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('deposito:editar')
  update(@Param('id') id: string, @Body() dto: UpdateArticuloDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }
}
