import { duracionEnMilisegundos } from './auth.service';

describe('configuración de autenticación', () => {
  const originalRefresh = process.env.REFRESH_TOKEN_EXPIRATION;

  afterEach(() => {
    if (originalRefresh === undefined) delete process.env.REFRESH_TOKEN_EXPIRATION;
    else process.env.REFRESH_TOKEN_EXPIRATION = originalRefresh;
  });

  it('usa la duración configurada del refresh token para la sesión persistida', () => {
    process.env.REFRESH_TOKEN_EXPIRATION = '36h';
    expect(duracionEnMilisegundos('REFRESH_TOKEN_EXPIRATION', '7d')).toBe(36 * 60 * 60 * 1000);
  });

  it('rechaza duraciones cero', () => {
    process.env.REFRESH_TOKEN_EXPIRATION = '0d';
    expect(() => duracionEnMilisegundos('REFRESH_TOKEN_EXPIRATION', '7d')).toThrow('duración positiva');
  });
});
