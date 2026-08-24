import { CsrfMiddleware } from './csrf.middleware';

describe('CsrfMiddleware', () => {
  const originalOrigin = process.env.CORS_ORIGIN;
  const middleware = new CsrfMiddleware();

  beforeEach(() => {
    process.env.CORS_ORIGIN = 'http://localhost:3000,https://sigbo.example.org';
  });

  afterAll(() => {
    if (originalOrigin === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = originalOrigin;
  });

  function request(
    method: string,
    cookie?: string,
    origin?: string,
    originalUrl = '/api/v1/recurso',
    cabeceraSolicitud?: string,
  ) {
    return {
      method,
      originalUrl,
      headers: cookie ? { cookie } : {},
      get: jest.fn().mockImplementation((header: string) => {
        if (header === 'origin') return origin;
        if (header === 'x-sigbo-request') return cabeceraSolicitud;
        return undefined;
      }),
    } as any;
  }

  function response() {
    const res = { status: jest.fn(), json: jest.fn() } as any;
    res.status.mockReturnValue(res);
    return res;
  }

  it('permite mutaciones autenticadas con Bearer sin exigir Origin', () => {
    const next = jest.fn();
    middleware.use(request('POST'), response(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('permite una mutación con cookie desde un origen autorizado', () => {
    const next = jest.fn();
    const req = request('PATCH', 'sigbo_access=token', 'https://sigbo.example.org', undefined, '1');
    middleware.use(req, response(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rechaza una mutación con cookie sin origen confiable', () => {
    const res = response();
    middleware.use(request('DELETE', 'sigbo_access=token', 'https://atacante.example'), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it('rechaza una mutación con cookie si falta la cabecera de intención', () => {
    const res = response();
    middleware.use(request('POST', 'sigbo_access=token', 'https://sigbo.example.org'), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rechaza login sin cookie cuando llega desde un formulario externo', () => {
    const res = response();
    middleware.use(
      request('POST', undefined, 'https://atacante.example', '/api/v1/auth/login'),
      res,
      jest.fn(),
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('permite login solo con origen autorizado y cabecera de intención', () => {
    const next = jest.fn();
    middleware.use(
      request('POST', undefined, 'https://sigbo.example.org', '/api/v1/auth/login', '1'),
      response(),
      next,
    );
    expect(next).toHaveBeenCalledTimes(1);
  });
});
