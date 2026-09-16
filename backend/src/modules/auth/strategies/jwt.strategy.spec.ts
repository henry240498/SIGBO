import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const payload = {
    sub: 'usuario-1',
    sid: 'sesion-1',
    email: 'usuario@example.org',
    username: 'usuario',
    roles: ['OPERADOR'],
  };
  const policyEngine = { getPermisosEfectivos: jest.fn() };

  beforeEach(() => {
    process.env.JWT_SECRET = 'a'.repeat(32);
    policyEngine.getPermisosEfectivos.mockReset().mockResolvedValue(['personal:ver']);
  });

  it('acepta solamente una sesión activa, vigente y perteneciente al usuario del token', async () => {
    const sesionRepo = { findOne: jest.fn().mockResolvedValue({
      id: 'sesion-1',
      usuarioId: 'usuario-1',
      activa: true,
      fechaExpiracion: new Date(Date.now() + 60_000),
    }) };
    const strategy = new JwtStrategy(sesionRepo as any, policyEngine as any);

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
    const strategy = new JwtStrategy(sesionRepo as any, policyEngine as any);

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(policyEngine.getPermisosEfectivos).not.toHaveBeenCalled();
  });

  it('rechaza tokens sin identificador de sesión', async () => {
    const strategy = new JwtStrategy({ findOne: jest.fn() } as any, policyEngine as any);

    await expect(strategy.validate({ ...payload, sid: '' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('usa los permisos vigentes aunque un token anterior incluya permisos revocados', async () => {
    const sesionRepo = { findOne: jest.fn().mockResolvedValue({
      usuarioId: payload.sub, activa: true, fechaExpiracion: new Date(Date.now() + 60_000),
    }) };
    const strategy = new JwtStrategy(sesionRepo as any, policyEngine as any);
    const tokenAnterior = { ...payload, permisos: ['seguridad:crear_usuario'] };
    const usuario = await strategy.validate(tokenAnterior);
    expect(usuario.permisos).toEqual(['personal:ver']);
    expect(policyEngine.getPermisosEfectivos).toHaveBeenCalledWith(payload.sub);
  });
});
