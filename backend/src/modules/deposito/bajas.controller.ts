import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { BajasService } from './bajas.service';
import { CreateBajaDepositoDto } from './dto/baja-deposito.dto';

@ApiTags('deposito/bajas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('deposito/bajas')
export class BajasController {
  constructor(private readonly service: BajasService) {}

  @Get()
  @RequirePermission('deposito:ver')
  findAll(
    @Query('tipoElemento') tipoElemento?: string,
    @Query('motivoBajaId') motivoBajaId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ tipoElemento, motivoBajaId, desde, hasta });
  }

  @Get(':id')
  @RequirePermission('deposito:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('deposito:baja')
  create(@Body() dto: CreateBajaDepositoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }
}
