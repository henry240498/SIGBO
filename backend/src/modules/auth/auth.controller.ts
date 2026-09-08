import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { establecerCookiesAuth, leerRefreshCookie, limpiarCookiesAuth } from './auth-cookies';
import { RateLimit } from '../denuncias/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../denuncias/guards/rate-limit.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private evitarCache(res: Response): void {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({ nombre: 'auth-login', ventanaMs: 15 * 60_000, maximo: 10, penalizacionMs: 15 * 60_000 })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.evitarCache(res);
    const resultado = await this.authService.login(
      dto.usernameOrEmail,
      dto.password,
      req.ip,
      req.headers['user-agent'],
    );
    establecerCookiesAuth(res, resultado.accessToken, resultado.refreshToken);
    // Las credenciales ya viajan en cookies HttpOnly. Exponerlas nuevamente en
    // JSON permitirÃ­a que un script inyectado las leyera y anularÃ­a esa
    // protecciÃ³n.
    return { usuario: resultado.usuario };
  }

  @Post('refresh')
  @UseGuards(RateLimitGuard)
  @RateLimit({ nombre: 'auth-refresh', ventanaMs: 15 * 60_000, maximo: 30, penalizacionMs: 5 * 60_000 })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.evitarCache(res);
    const refreshToken = dto.refreshToken ?? leerRefreshCookie(req);
    if (!refreshToken) throw new UnauthorizedException('Refresh token requerido');
    const resultado = await this.authService.refresh(refreshToken);
    establecerCookiesAuth(res, resultado.accessToken, resultado.refreshToken);
    return { usuario: resultado.usuario };
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.evitarCache(res);
    const refreshToken = dto.refreshToken ?? leerRefreshCookie(req);
    if (refreshToken) await this.authService.logout(refreshToken);
    limpiarCookiesAuth(res);
    return { ok: true };
  }
}
