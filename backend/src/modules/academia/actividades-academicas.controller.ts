import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ActividadesAcademicasService } from './actividades-academicas.service';
import { CreateActividadAcademicaDto } from './dto/create-actividad-academica.dto';
import { UpdateActividadAcademicaDto } from './dto/update-actividad-academica.dto';
import { AsignarInstructorDto } from './dto/asignar-instructor.dto';

@ApiTags('academia/actividades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academia/actividades')
export class ActividadesAcademicasController {
  constructor(private readonly service: ActividadesAcademicasService) {}

  @Get()
  @RequirePermission('academia:ver')
  findAll(
    @Query('tipoActividadId') tipoActividadId?: string,
    @Query('estado') estado?: string,
    @Query('esExterna') esExterna?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.findAll({ tipoActividadId, estado, esExterna, desde, hasta });
  }

  @Get(':id')
  @RequirePermission('academia:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('academia:crear_curso')
  create(@Body() dto: CreateActividadAcademicaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(':id')
  @RequirePermission('academia:editar_curso')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateActividadAcademicaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Get(':id/instructores')
  @RequirePermission('academia:ver')
  listarInstructores(@Param('id') id: string) {
    return this.service.listarInstructores(id);
  }

  @Post(':id/instructores')
  @RequirePermission('academia:gestionar_instructores')
  asignarInstructor(
    @Param('id') id: string,
    @Body() dto: AsignarInstructorDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.asignarInstructor(id, dto, user.id, req.ip);
  }

  @Delete(':id/instructores/:instructorId')
  @RequirePermission('academia:gestionar_instructores')
  quitarInstructor(
    @Param('id') id: string,
    @Param('instructorId') instructorId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitarInstructor(id, instructorId, user.id, req.ip);
  }
}
