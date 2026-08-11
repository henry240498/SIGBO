import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { PublicacionPublica,PublicacionesService } from './publicaciones.service';
@Controller('publicaciones')
export class PublicacionesController{
 constructor(private readonly service:PublicacionesService){}
 @Get('publicas') publicas(){return this.service.listar(false)}
 @Get('estadisticas') estadisticas(@Query('anio') anio?:string){return this.service.estadisticas(anio?Number(anio):undefined)}
 @Get() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('publicaciones:administrar','seguridad:configurar_apariencia') todas(){return this.service.listar(true)}
 @Put() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('publicaciones:administrar','seguridad:configurar_apariencia') reemplazar(@Body() items:PublicacionPublica[]){return this.service.reemplazar(items)}
}
