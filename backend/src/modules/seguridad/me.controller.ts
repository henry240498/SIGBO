import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UsuariosService } from './usuarios.service';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';

@ApiTags('seguridad/mis-datos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seguridad')
export class MeController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('mis-permisos')
  misPermisos(@CurrentUser() user: AuthenticatedUser) {
    return user.permisos;
  }

  @Get('mis-roles')
  misRoles(@CurrentUser() user: AuthenticatedUser) {
    return this.usuariosService.getRoles(user.id);
  }

  @Post('me/password')
  cambiarPassword(
    @Body() dto: CambiarPasswordDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.usuariosService.cambiarPasswordPropia(user.id, dto, {
      actorId: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
  }
}
