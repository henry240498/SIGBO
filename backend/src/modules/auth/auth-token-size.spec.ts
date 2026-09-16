import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('sesión de administrador con catálogo extenso', () => {
  const nombresEntorno = ['JWT_SECRET', 'REFRESH_TOKEN_SECRET', 'JWT_EXPIRATION', 'REFRESH_TOKEN_EXPIRATION'];
  const originales = nombresEntorno.map((nombre) => process.env[nombre]);

  beforeEach(() => {
    process.env.JWT_SECRET = 'a'.repeat(48);
    process.env.REFRESH_TOKEN_SECRET = 'b'.repeat(48);
    process.env.JWT_EXPIRATION = '15m';
    process.env.REFRESH_TOKEN_EXPIRATION = '7d';
  });

  afterEach(() => {
    nombresEntorno.forEach((nombre, i) => {
      if (originales[i] === undefined) delete process.env[nombre];
      else process.env[nombre] = originales[i];
    });
  });

  it('login y renovación emiten cookies menores a 4 KB sin recortar los permisos del perfil', async () => {
    const password = 'Prueba-local!123';
    const usuario = {
      id: 'usuario-admin', username: 'admin', email: 'admin@example.org', estado: 'ACTIVO',
      passwordHash: await bcrypt.hash(password, 4), debeCambiarPassword: false,
    };
    const permisos = Array.from({ length: 400 }, (_, i) => `organizacion:administrar_recurso_${i}`);
    const consultaUsuario = { where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(usuario) };
    const usuarioRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(consultaUsuario),
      update: jest.fn().mockResolvedValue({ affected: 1 }), findOne: jest.fn().mockResolvedValue(usuario),
    };
    let sesion: any;
    const sesionRepo = {
      create: jest.fn((datos) => datos),
      save: jest.fn(async (datos) => (sesion = { ...datos, id: 'sesion-admin' })),
      findOne: jest.fn(async () => sesion),
      update: jest.fn(async (_criterio, datos) => {
        Object.assign(sesion, datos);
        return { affected: 1 };
      }),
    };
    const consultaRoles = {
      where: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([{ nombre: 'Administrador General' }]),
    };
    const jwt = new JwtService();
    const servicio = new AuthService(
      usuarioRepo as any, sesionRepo as any,
      { find: jest.fn().mockResolvedValue([{ rolId: 'rol-admin' }]) } as any,
      { createQueryBuilder: jest.fn().mockReturnValue(consultaRoles) } as any,
      jwt, { getPermisosEfectivos: jest.fn().mockResolvedValue(permisos) } as any,
      { registrar: jest.fn() } as any,
    );
    const login = await servicio.login(usuario.username, password);
    const renovacion = await servicio.refresh(login.refreshToken);
    for (const resultado of [login, renovacion]) {
      const cookie = `sigbo_access=${resultado.accessToken}; Path=/api/v1; HttpOnly; SameSite=Lax`;
      expect(Buffer.byteLength(cookie, 'utf8')).toBeLessThan(4096);
      expect(resultado.usuario.permisos).toEqual(permisos);
      expect(jwt.verify(resultado.accessToken, { secret: process.env.JWT_SECRET })).toMatchObject({
        sub: usuario.id, sid: sesion.id,
      });
    }
  });
});
