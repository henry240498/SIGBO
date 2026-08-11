import { Body, Controller, Post } from '@nestjs/common';

interface LoginDto {
  usernameOrEmail?: string;
  password?: string;
}

@Controller('api/v1/auth')
export class AuthController {
  @Post('login')
  login(@Body() body: LoginDto) {
    const usernameOrEmail = body?.usernameOrEmail?.trim();
    const password = body?.password?.trim();

    const normalizedUser = usernameOrEmail?.toUpperCase();

    if (normalizedUser === 'BC93' && password === '1234') {
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        usuario: {
          id: '1',
          email: 'bc93@sigbo.local',
          username: 'BC93',
          roles: ['usuario'],
          permisos: ['read', 'write'],
          debeCambiarPassword: false,
        },
      };
    }

    return {
      statusCode: 401,
      message: 'Credenciales inválidas',
    };
  }

  @Post('logout')
  logout() {
    return { ok: true };
  }

  @Post('refresh')
  refresh() {
    return {
      accessToken: 'mock-access-token',
    };
  }
}
