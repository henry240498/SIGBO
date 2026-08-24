import { Request, Response } from 'express';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const resultado = {
    accessToken: 'access-secreto',
    refreshToken: 'refresh-secreto',
    usuario: {
      id: 'usuario-1',
      email: 'usuario@institucion.local',
      username: 'usuario',
      roles: ['rol'],
      permisos: ['seguridad:ver'],
      debeCambiarPassword: false,
    },
  };

  function respuesta(): Response {
    return {
      setHeader: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
  }

  it('entrega login mediante cookies sin serializar tokens en JSON', async () => {
    const authService = { login: jest.fn().mockResolvedValue(resultado) };
    const controller = new AuthController(authService as any);
    const res = respuesta();

    const body = await controller.login(
      { usernameOrEmail: 'usuario', password: 'secreto' },
      { ip: '127.0.0.1', headers: {} } as Request,
      res,
    );

    expect(body).toEqual({ usuario: resultado.usuario });
    expect(JSON.stringify(body)).not.toContain('access-secreto');
    expect(JSON.stringify(body)).not.toContain('refresh-secreto');
    expect(res.cookie).toHaveBeenCalledTimes(2);
  });

  it('renueva cookies sin exponer el par de tokens', async () => {
    const authService = { refresh: jest.fn().mockResolvedValue(resultado) };
    const controller = new AuthController(authService as any);
    const res = respuesta();

    const body = await controller.refresh({ refreshToken: 'entrada' }, { headers: {} } as Request, res);

    expect(authService.refresh).toHaveBeenCalledWith('entrada');
    expect(body).toEqual({ usuario: resultado.usuario });
    expect(JSON.stringify(body)).not.toContain('access-secreto');
    expect(JSON.stringify(body)).not.toContain('refresh-secreto');
  });
});
