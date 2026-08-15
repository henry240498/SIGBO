import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IaChatService } from './ia-chat.service';
import { IaConversacionesService } from './ia-conversaciones.service';
import { IaConfiguracionService } from './ia-configuracion.service';
import { ChatIaDto } from './dto/chat-ia.dto';
import { IaRateLimitGuard } from './guards/ia-rate-limit.guard';

@ApiTags('ia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia')
export class IaChatController {
  constructor(
    private readonly chatService: IaChatService,
    private readonly conversacionesService: IaConversacionesService,
    private readonly configuracionService: IaConfiguracionService,
  ) {}

  /** Solo los campos de presentacion para el widget de chat -- nunca las
   * instrucciones institucionales, limites ni datos del proveedor. */
  @Get('perfil')
  @RequirePermission('inteligencia:usar')
  async perfil() {
    const config = await this.configuracionService.obtener();
    return {
      nombre: config.nombre,
      personaje: config.personaje,
      descripcion: config.descripcion,
      avatarUrl: config.avatarUrl,
      avatarEmoji: config.avatarEmoji,
      avatarColorFondo: config.avatarColorFondo,
      saludo: config.saludo,
      estado: config.estado,
      mensajeMantenimiento: config.mensajeMantenimiento,
    };
  }

  @Post('chat')
  @RequirePermission('inteligencia:usar')
  @UseGuards(IaRateLimitGuard)
  chat(@Body() dto: ChatIaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.chatService.chat(user, dto, req.ip ?? null, req.headers['user-agent'] ?? null);
  }

  @Get('conversaciones')
  @RequirePermission('inteligencia:usar')
  misConversaciones(@CurrentUser() user: AuthenticatedUser) {
    return this.conversacionesService.misConversaciones(user.id);
  }

  @Get('conversaciones/:id')
  @RequirePermission('inteligencia:usar')
  mensajesDe(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.conversacionesService.mensajesDe(id, user);
  }
}
