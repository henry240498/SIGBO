import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { ConfiguracionService } from './configuracion.service';
import { ActualizarBorradorDto, RestaurarVersionDto, ValoresConfiguracionDto } from './dto/configuracion.dto';

@ApiTags('configuracion')
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly service:ConfiguracionService){}
  @Get('publica') publica(){return this.service.publica();}
  @Get('registro-publico') registroPublico(){return this.service.registro(true);}

  @Get('mis-preferencias') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  preferencias(@CurrentUser() user:AuthenticatedUser){return this.service.preferencias(user.id);}
  @Put('mis-preferencias') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
  guardarPreferencias(@Body() dto:ValoresConfiguracionDto,@CurrentUser() user:AuthenticatedUser){return this.service.guardarPreferencias(user.id,dto.values);}

  @Get('admin/registro') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:ver','seguridad:configurar_apariencia')
  registro(){return this.service.registro();}
  @Post('admin/borradores') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:editar_borrador','seguridad:configurar_apariencia')
  crear(@CurrentUser() user:AuthenticatedUser){return this.service.crearBorrador(user.id);}
  @Get('admin/borradores/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:ver','seguridad:configurar_apariencia')
  borrador(@Param('id') id:string){return this.service.obtenerBorrador(id);}
  @Put('admin/borradores/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:editar_borrador','seguridad:configurar_apariencia')
  editar(@Param('id') id:string,@Body() dto:ActualizarBorradorDto,@CurrentUser() user:AuthenticatedUser){return this.service.actualizarBorrador(id,dto.values,dto.motivo,user.id);}
  @Post('admin/borradores/:id/validar') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:ver','seguridad:configurar_apariencia')
  validar(@Param('id') id:string){return this.service.validarBorrador(id);}
  @Post('admin/borradores/:id/publicar') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:publicar','seguridad:configurar_apariencia')
  publicar(@Param('id') id:string,@CurrentUser() user:AuthenticatedUser){return this.service.publicar(id,user.id);}
  @Get('admin/versiones') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:ver','seguridad:configurar_apariencia')
  versiones(){return this.service.versiones();}
  @Post('admin/versiones/:id/restaurar') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:restaurar','seguridad:configurar_apariencia')
  restaurar(@Param('id') id:string,@Body() dto:RestaurarVersionDto,@CurrentUser() user:AuthenticatedUser){return this.service.restaurar(id,dto.motivo,user.id);}
  @Get('admin/exportar') @ApiBearerAuth() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('configuracion:exportar','seguridad:configurar_apariencia')
  exportar(){return this.service.exportar();}
}
