import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CuentasBancariasService } from './cuentas-bancarias.service';
import { CreateCuentaBancariaDto, UpdateCuentaBancariaDto } from './dto/cuenta-bancaria.dto';

/** GET exige 'finanzas:ver' (igual que el resto del modulo -- se
 * necesita para combos de movimientos); crear/editar exige
 * 'finanzas:administrar_cajas' porque son datos bancarios sensibles
 * de configuracion (seccion 11: "nunca mostrar informacion bancaria
 * sensible a usuarios sin permiso" -- el enmascarado de campos queda
 * pendiente, ver informe final). */
@ApiTags('finanzas/cuentas-bancarias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finanzas/cuentas-bancarias')
export class CuentasBancariasController {
  constructor(private readonly service: CuentasBancariasService) {}

  @Get()
  @RequirePermission('finanzas:ver')
  findAll(@Query('estado') estado?: string) {
    return this.service.findAll(estado);
  }

  @Get(':id')
  @RequirePermission('finanzas:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('finanzas:administrar_cajas')
  create(@Body() dto: CreateCuentaBancariaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('finanzas:administrar_cajas')
  update(@Param('id') id: string, @Body() dto: UpdateCuentaBancariaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }
}
