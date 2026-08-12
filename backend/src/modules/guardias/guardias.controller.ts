import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { GuardiasService } from './guardias.service';
import { GeneracionService } from './generacion.service';
import { CreateGuardiaDto } from './dto/create-guardia.dto';
import { UpdateGuardiaDto, AnularGuardiaDto } from './dto/update-guardia.dto';
import { AsignarPersonalDto } from './dto/asignar-personal.dto';
import { RegistrarHorarioDto } from './dto/registrar-horario.dto';
import { ActualizarPresenciaDto } from './dto/actualizar-presencia.dto';
import { GenerarPlanificacionDto } from './dto/generar-planificacion.dto';
import { ReemplazarAsignacionDto } from './dto/reemplazar-asignacion.dto';

/** Restringe los parametros :id de esta ruta a la forma de un GUID. Sin
 * esta restriccion, `GET /guardias/:id` intercepta cualquier subpath
 * literal registrado despues bajo /guardias/ (ej. /guardias/grupos,
 * /guardias/esquemas-horario, /guardias/pernoctes, /guardias/requisitos-rol)
 * porque Express prueba las rutas en el orden en que se registran los
 * controllers, no por especificidad. */
const GUID_PATH = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

@ApiTags('guardias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias')
export class GuardiasController {
  constructor(
    private readonly service: GuardiasService,
    private readonly generacionService: GeneracionService,
  ) {}

  @Get()
  @RequirePermission('guardias:ver')
  findAll(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.service.findAll(desde, hasta);
  }

  /** Literal, no colisiona con :id(GUID) -- historial de guardias de una
   * persona (seccion 42 del pedido). */
  @Get('personal/:bomberoId')
  @RequirePermission('guardias:ver')
  historialPersonal(@Param('bomberoId') bomberoId: string) {
    return this.service.historialPersonal(bomberoId);
  }

  /** Registrado antes de POST '/' para que Nest/Express no lo confunda con
   * ninguna ruta generica -- aqui no hay riesgo real de colision (paths
   * distintos), pero se mantiene el mismo orden defensivo usado en todo
   * este controller. */
  @Post('generar')
  @RequirePermission('guardias:crear')
  generar(@Body() dto: GenerarPlanificacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.generacionService.generar(
      dto.desde,
      dto.hasta,
      { permitirRepetirIntegrantes: dto.permitirRepetirIntegrantes, regenerarExistentes: dto.regenerarExistentes },
      user.id,
      req.ip,
    );
  }

  @Get(`:id(${GUID_PATH})`)
  @RequirePermission('guardias:ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission('guardias:crear')
  create(@Body() dto: CreateGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.create(dto, user.id, req.ip);
  }

  @Patch(`:id(${GUID_PATH})`)
  @RequirePermission('guardias:editar')
  update(@Param('id') id: string, @Body() dto: UpdateGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.update(id, dto, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/anular`)
  @RequirePermission('guardias:eliminar')
  anular(@Param('id') id: string, @Body() dto: AnularGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto.motivo, user.id, req.ip);
  }

  @Get(`:id(${GUID_PATH})/asignaciones`)
  @RequirePermission('guardias:ver')
  listarAsignaciones(@Param('id') id: string) {
    return this.service.listarAsignaciones(id);
  }

  @Post(`:id(${GUID_PATH})/asignaciones`)
  @RequirePermission('guardias:asignar')
  asignarPersonal(
    @Param('id') id: string,
    @Body() dto: AsignarPersonalDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.asignarPersonal(id, dto, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/asignaciones/:asignacionId/reemplazar`)
  @RequirePermission('guardias:reemplazar')
  reemplazarAsignacion(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @Body() dto: ReemplazarAsignacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.reemplazarAsignacion(id, asignacionId, dto, user.id, req.ip);
  }

  @Delete(`:id(${GUID_PATH})/asignaciones/:asignacionId`)
  @RequirePermission('guardias:editar')
  quitarAsignacion(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.quitarAsignacion(id, asignacionId, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/asignaciones/:asignacionId/horario`)
  @RequirePermission('guardias:editar')
  registrarHorario(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @Body() dto: RegistrarHorarioDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarHorario(id, asignacionId, dto, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/asignaciones/:asignacionId/presencia`)
  @RequirePermission('guardias:editar')
  actualizarPresencia(
    @Param('id') id: string,
    @Param('asignacionId') asignacionId: string,
    @Body() dto: ActualizarPresenciaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.actualizarPresencia(id, asignacionId, dto, user.id, req.ip);
  }

  @Get(`:id(${GUID_PATH})/cumplimiento/:bomberoId`)
  @RequirePermission('guardias:ver')
  calcularCumplimiento(@Param('id') id: string, @Param('bomberoId') bomberoId: string) {
    return this.service.calcularCumplimiento(id, bomberoId);
  }
}
