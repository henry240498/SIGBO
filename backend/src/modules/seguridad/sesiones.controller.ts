import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { SesionesService } from './sesiones.service';
import { AuditoriaService } from './auditoria.service';

@ApiTags('seguridad/sesiones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('seguridad/sesiones')
export class SesionesController {
  constructor(
    private readonly sesionesService: SesionesService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  @Get()
  @RequirePermission('seguridad:ver_usuarios')
  findActivas() {
    return this.sesionesService.findActivas();
  }

  @Get('mias')
  misSesiones(@CurrentUser() user:AuthenticatedUser){return this.sesionesService.findByUsuario(user.id);}

  @Delete('mias/:id')
  async cerrarPropia(@Param('id') id:string,@CurrentUser() user:AuthenticatedUser,@Req() req:Request){
    await this.sesionesService.cerrarPropia(id,user.id);
    await this.auditoriaService.registrar({usuarioId:user.id,accion:'CERRAR_SESION_PROPIA',recurso:'sesion',recursoId:id,ip:req.ip,userAgent:req.headers['user-agent'] as string});
    return{ok:true};
  }

  @Post('mias/cerrar-todas')
  async cerrarTodasPropias(@CurrentUser() user:AuthenticatedUser,@Req() req:Request){
    const total=await this.sesionesService.cerrarTodas(user.id);
    await this.auditoriaService.registrar({usuarioId:user.id,accion:'CERRAR_SESIONES_PROPIAS',recurso:'sesion',recursoId:user.id,datosDespues:{total},ip:req.ip,userAgent:req.headers['user-agent'] as string});
    return{ok:true,total};
  }

  @Delete(':id')
  @RequirePermission('seguridad:cerrar_sesion')
  async cerrar(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const sesion = await this.sesionesService.cerrar(id);
    await this.auditoriaService.registrar({
      usuarioId: user.id,
      accion: 'CERRAR_SESION_REMOTA',
      recurso: 'sesion',
      recursoId: id,
      datosDespues: { usuarioAfectado: sesion.usuarioId },
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    return { ok: true };
  }
}
