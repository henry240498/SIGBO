import {
  establecerCookiesAuth,
  extraerAccessToken,
  leerCookie,
  leerRefreshCookie,
  obtenerOrigenesCors,
  validarConfiguracionCookies,
} from './auth-cookies';

describe('cookies de autenticación', () => {
  const cookieSecureOriginal = process.env.AUTH_COOKIE_SECURE;
  const cookieSameSiteOriginal = process.env.AUTH_COOKIE_SAME_SITE;
  const corsOriginOriginal = process.env.CORS_ORIGIN;
  const refreshExpirationOriginal = process.env.REFRESH_TOKEN_EXPIRATION;

  afterEach(() => {
    if (cookieSecureOriginal === undefined) delete process.env.AUTH_COOKIE_SECURE;
    else process.env.AUTH_COOKIE_SECURE = cookieSecureOriginal;
    if (cookieSameSiteOriginal === undefined) delete process.env.AUTH_COOKIE_SAME_SITE;
    else process.env.AUTH_COOKIE_SAME_SITE = cookieSameSiteOriginal;
    if (corsOriginOriginal === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = corsOriginOriginal;
    if (refreshExpirationOriginal === undefined) delete process.env.REFRESH_TOKEN_EXPIRATION;
    else process.env.REFRESH_TOKEN_EXPIRATION = refreshExpirationOriginal;
  });

  it('extrae cookies codificadas sin confundir sus nombres', () => {
    const req = { headers: { cookie: 'otra=valor; sigbo_refresh=token%2Econ%3Dsigno; sigbo_access=access' } } as any;

    expect(leerRefreshCookie(req)).toBe('token.con=signo');
    expect(leerCookie(req, 'sigbo_access')).toBe('access');
    expect(leerCookie(req, 'sigbo')).toBeUndefined();
  });

  it('prioriza Bearer para conservar compatibilidad de clientes API', () => {
    const req = { headers: { authorization: 'Bearer externo', cookie: 'sigbo_access=cookie' } } as any;

    expect(extraerAccessToken(req)).toBe('externo');
  });

  it('usa la cookie de acceso cuando no llega Authorization', () => {
    const req = { headers: { cookie: 'sigbo_access=desde-cookie' } } as any;

    expect(extraerAccessToken(req)).toBe('desde-cookie');
  });

  it('rechaza SameSite none sin cookies seguras al iniciar', () => {
    process.env.AUTH_COOKIE_SAME_SITE = 'none';
    process.env.AUTH_COOKIE_SECURE = 'false';

    expect(validarConfiguracionCookies).toThrow('AUTH_COOKIE_SAME_SITE=none requiere AUTH_COOKIE_SECURE=true.');
  });

  it('rechaza valores de cookie no reconocidos al iniciar', () => {
    process.env.AUTH_COOKIE_SAME_SITE = 'inseguro';

    expect(validarConfiguracionCookies).toThrow('AUTH_COOKIE_SAME_SITE debe ser lax, strict o none.');
  });

  it('admite una lista explícita de orígenes para CORS', () => {
    process.env.CORS_ORIGIN = 'http://localhost:3000, https://sigbo.example.org';

    expect(obtenerOrigenesCors()).toEqual(['http://localhost:3000', 'https://sigbo.example.org']);
  });

  it('alinea el vencimiento de refresh con el token configurado', () => {
    process.env.REFRESH_TOKEN_EXPIRATION = '36h';
    const cookie = jest.fn();
    const res = { cookie } as any;

    establecerCookiesAuth(res, 'access', 'refresh');

    expect(cookie).toHaveBeenLastCalledWith(
      'sigbo_refresh',
      'refresh',
      expect.objectContaining({ maxAge: 36 * 60 * 60 * 1000 }),
    );
  });

  it('rechaza comodines CORS con autenticación basada en cookies', () => {
    process.env.CORS_ORIGIN = '*';

    expect(validarConfiguracionCookies).toThrow('CORS_ORIGIN debe contener uno o más orígenes explícitos; no se permite *.');
  });
});
