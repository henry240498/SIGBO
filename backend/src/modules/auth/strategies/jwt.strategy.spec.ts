import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const payload = {
    sub: 'usuario-1',
    sid: 'sesion-1',
    email: 'usuario@example.org',
    username: 'usuario',
    roles: ['OPERADOR'],
    permisos: ['personal:ver'],
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'a'.repeat(32);
  });

  it('acepta solamente una sesión activa, vigente y perteneciente al usuario del token', async () => {
    const sesionRepo = { findOne: jest.fn().mockResolvedValue({
      id: 'sesion-1',
      usuarioId: 'usuario-1',
      activa: true,
      fechaExpiracion: new Date(Date.now() + 60_000),
    }) };
    const strategy = new JwtStrategy(sesionRepo as any);

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 'usuario-1',
      email: 'usuario@example.org',
      username: 'usuario',
      roles: ['OPERADOR'],
      permisos: ['personal:ver'],
    });
  });

  it('rechaza un token cuando su sesión fue revocada', async () => {
    const sesionRepo = { findOne: jest.fn().mockResolvedValue({
      id: 'sesion-1',
      usuarioId: 'usuario-1',
      activa: false,
      fechaExpiracion: new Date(Date.now() + 60_000),
    }) };
    const strategy = new JwtStrategy(sesionRepo as any);

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza tokens sin identificador de sesión', async () => {
    const strategy = new JwtStrategy({ findOne: jest.fn() } as any);

    await expect(strategy.validate({ ...payload, sid: '' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
