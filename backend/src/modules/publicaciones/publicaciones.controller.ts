import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
 @Post() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('publicaciones:administrar','seguridad:configurar_apariencia') crear(@Body() item:PublicacionPublica){return this.service.crear(item)}
 @Put(':id') @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('publicaciones:administrar','seguridad:configurar_apariencia') actualizar(@Param('id') id:string,@Body() item:PublicacionPublica){return this.service.actualizar(id,item)}
 @Delete(':id') @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('publicaciones:administrar','seguridad:configurar_apariencia') eliminar(@Param('id') id:string){return this.service.eliminar(id)}
<<<<<<< Updated upstream
=======
 @Put() @UseGuards(JwtAuthGuard,PermissionsGuard) @RequirePermission('publicaciones:administrar','seguridad:configurar_apariencia') reemplazar(@Body() items:PublicacionPublica[]){return this.service.reemplazar(items)}
>>>>>>> Stashed changes
}
