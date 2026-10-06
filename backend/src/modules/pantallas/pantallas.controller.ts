import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { GuardarReglaPantallaDto, RegistrarNavegacionDto } from './dto/pantallas.dto';
import { NavegacionService } from './navegacion.service';
import { PantallasService } from './pantallas.service';

/** Permisos por pantalla (rol, usuario, rango, cargo). Configurarlos requiere seguridad:gestionar_pantallas. */
@ApiTags('pantallas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pantallas')
export class PantallasController {
  constructor(private readonly pantallas: PantallasService) {}

  /** Lo que la persona puede hacer en cada pantalla: la app lo usa para ocultar; el backend igual lo exige. */
  @Get('mis-permisos')
  @RequirePermission('navegacion:registrar')
  misPermisos(@CurrentUser() user: AuthenticatedUser) {
    return this.pantallas.misPermisos(user);
  }

  @Get()
  @RequirePermission('seguridad:gestionar_pantallas')
  listar() {
    return this.pantallas.listarPantallas();
  }

  @Get('sujetos')
  @RequirePermission('seguridad:gestionar_pantallas')
  sujetos() {
    return this.pantallas.sujetos();
  }

  @Get('reglas')
  @RequirePermission('seguridad:gestionar_pantallas')
  reglas(@Query('codigo') codigo?: string) {
    return this.pantallas.listarReglas(codigo);
  }

  @Put('reglas')
  @RequirePermission('seguridad:gestionar_pantallas')
  guardar(@Body() dto: GuardarReglaPantallaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.pantallas.guardarRegla(dto, { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Delete('reglas/:id')
  @RequirePermission('seguridad:gestionar_pantallas')
  quitar(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.pantallas.eliminarRegla(id, { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'] });
  }
}

/** Auditoria de navegacion: la app registra; solo la web administrativa consulta. */
@ApiTags('navegacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('navegacion')
export class NavegacionController {
  constructor(private readonly navegacion: NavegacionService) {}

  @Post()
  @RequirePermission('navegacion:registrar')
  registrar(@Body() dto: RegistrarNavegacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.navegacion.registrar(dto, { usuarioId: user.id, username: user.username, ip: req.ip });
  }

  @Get('linea')
  @RequirePermission('seguridad:ver_navegacion')
  linea(
    @Query('usuarioId', new ParseUUIDPipe()) usuarioId: string,
    @Query('fecha') fecha: string,
    @Query('servicioId') servicioId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    if (!fecha) throw new BadRequestException('Indique la fecha (AAAA-MM-DD).');
    return this.navegacion.lineaDeUsuario(usuarioId, fecha, servicioId, { usuarioId: user.id, username: user.username, ip: req.ip });
  }
}
