import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { enviarExportacion } from '../../shared/utils/exportar-respuesta';
import { BomberosService } from './bomberos.service';
import { CreateBomberoDto } from './dto/create-bombero.dto';
import { UpdateBomberoDto } from './dto/update-bombero.dto';

@ApiTags('personal/bomberos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('personal/bomberos')
export class BomberosController {
  constructor(private readonly bomberosService: BomberosService) {}

  @Get()
  @RequirePermission('personal:ver')
  findAll(@Query('estado') estado?: string) {
    return this.bomberosService.findAll(estado);
  }

  @Get('exportar/excel')
  @RequirePermission('personal:ver')
  async exportarExcel(@Query('estado') estado: string | undefined, @Res() res: Response) {
    const filas = await this.bomberosService.filasExportables(estado);
    await enviarExportacion(res, 'excel', filas, 'personal', 'Personal - Bomberos');
  }

  @Get('exportar/pdf')
  @RequirePermission('personal:ver')
  async exportarPdf(@Query('estado') estado: string | undefined, @Res() res: Response) {
    const filas = await this.bomberosService.filasExportables(estado);
    await enviarExportacion(res, 'pdf', filas, 'personal', 'Personal - Bomberos');
  }

  @Get(':id')
  @RequirePermission('personal:ver')
  findOne(@Param('id') id: string) {
    return this.bomberosService.findOne(id);
  }

  @Post()
  @RequirePermission('personal:crear')
  create(@Body() dto: CreateBomberoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.bomberosService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermission('personal:editar')
  update(@Param('id') id: string, @Body() dto: UpdateBomberoDto, @CurrentUser() user: AuthenticatedUser) {
    return this.bomberosService.update(id, dto, user.id);
  }

  @Patch(':id/baja')
  @RequirePermission('personal:eliminar')
  darBaja(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bomberosService.darBaja(id, motivo, user.id);
  }
}
