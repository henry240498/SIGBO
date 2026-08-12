import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OrdenesGuardiaService } from './ordenes-guardia.service';
import { OrdenGuardiaConfiguracionService } from './orden-guardia-configuracion.service';
import { CreateOrdenGuardiaDto } from './dto/create-orden-guardia.dto';
import { ActualizarConfiguracionOrdenDto } from './dto/actualizar-configuracion-orden.dto';
import { AnularOrdenGuardiaDto, RegistrarModificacionOrdenDto } from './dto/anular-orden-guardia.dto';

/** "ordenes" (y "configuracion") nunca matchean la forma de un GUID, asi que
 * no hay riesgo de colision con GuardiasController#findOne
 * (`guardias/:id(${GUID_PATH})`) sin importar el orden de registro de
 * controllers -- mismo mecanismo defensivo ya documentado alli. */
const GUID_PATH = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

@ApiTags('guardias/ordenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('guardias/ordenes')
export class OrdenesGuardiaController {
  constructor(
    private readonly service: OrdenesGuardiaService,
    private readonly configuracionService: OrdenGuardiaConfiguracionService,
  ) {}

  @Get()
  @RequirePermission('guardias:ordenes_ver')
  findAll(@Query('anio') anio?: string, @Query('mes') mes?: string, @Query('estado') estado?: string) {
    return this.service.findAll(anio ? Number(anio) : undefined, mes ? Number(mes) : undefined, estado);
  }

  @Get('configuracion')
  @RequirePermission('guardias:ordenes_ver')
  obtenerConfiguracion() {
    return this.configuracionService.obtener();
  }

  @Put('configuracion')
  @RequirePermission('guardias:ordenes_configurar')
  actualizarConfiguracion(@Body() dto: ActualizarConfiguracionOrdenDto, @CurrentUser() user: AuthenticatedUser) {
    return this.configuracionService.actualizar(dto, user.id);
  }

  @Post()
  @RequirePermission('guardias:ordenes_crear')
  crear(@Body() dto: CreateOrdenGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.crear(dto, user.id, req.ip);
  }

  @Get(`:id(${GUID_PATH})`)
  @RequirePermission('guardias:ordenes_ver')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(`:id(${GUID_PATH})/regenerar-preview`)
  @RequirePermission('guardias:ordenes_editar')
  regenerarPreview(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.regenerarPreview(id, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/generar-documentos`)
  @RequirePermission('guardias:ordenes_editar')
  generarDocumentos(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.generarDocumentos(id, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/revisar`)
  @RequirePermission('guardias:ordenes_editar')
  revisar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.revisar(id, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/volver-borrador`)
  @RequirePermission('guardias:ordenes_editar')
  volverABorrador(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.volverABorrador(id, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/aprobar`)
  @RequirePermission('guardias:ordenes_aprobar')
  aprobar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.aprobar(id, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/publicar`)
  @RequirePermission('guardias:ordenes_publicar')
  publicar(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.publicar(id, user.id, req.ip);
  }

  @Post(`:id(${GUID_PATH})/anular`)
  @RequirePermission('guardias:ordenes_anular')
  anular(@Param('id') id: string, @Body() dto: AnularOrdenGuardiaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.service.anular(id, dto, user.id, req.ip);
  }

  @Get(`:id(${GUID_PATH})/modificaciones`)
  @RequirePermission('guardias:ordenes_ver')
  listarModificaciones(@Param('id') id: string) {
    return this.service.listarModificaciones(id);
  }

  @Post(`:id(${GUID_PATH})/modificaciones`)
  @RequirePermission('guardias:ordenes_editar')
  registrarModificacion(
    @Param('id') id: string,
    @Body() dto: RegistrarModificacionOrdenDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.registrarModificacion(id, dto, user.id, req.ip);
  }
}
