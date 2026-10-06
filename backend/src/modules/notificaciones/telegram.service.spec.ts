import { TelegramService } from './telegram.service';

describe('TelegramService', () => {
  const original = { token: process.env.TELEGRAM_BOT_TOKEN, chat: process.env.TELEGRAM_CHAT_ID };
  let servicio: TelegramService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    servicio = new TelegramService();
    fetchMock = jest.spyOn(global, 'fetch');
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  afterEach(() => {
    fetchMock.mockRestore();
    if (original.token === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = original.token;
    if (original.chat === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = original.chat;
  });

  const configurar = () => {
    process.env.TELEGRAM_BOT_TOKEN = '123456:SECRETO-DE-PRUEBA';
    process.env.TELEGRAM_CHAT_ID = '-100999';
  };

  it('sin configuracion no hace nada y no llama a la red', async () => {
    expect(servicio.habilitado()).toBe(false);
    expect(await servicio.enviar('hola')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('con solo uno de los dos datos tampoco se habilita', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'abc';
    expect(servicio.habilitado()).toBe(false);
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.TELEGRAM_CHAT_ID = '1';
    expect(servicio.habilitado()).toBe(false);
  });

  it('envia el mensaje a la API de bots con el chat configurado', async () => {
    configurar();
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response);
    expect(await servicio.enviar('Convocatoria: incendio')).toBe(true);
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.telegram.org/bot123456:SECRETO-DE-PRUEBA/sendMessage');
    expect(JSON.parse((opciones as RequestInit).body as string)).toEqual({
      chat_id: '-100999',
      text: 'Convocatoria: incendio',
      disable_web_page_preview: true,
    });
  });

  it('un mensaje larguisimo se recorta', async () => {
    configurar();
    fetchMock.mockResolvedValue({ ok: true, status: 200 } as Response);
    await servicio.enviar('x'.repeat(10_000));
    const cuerpo = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(cuerpo.text.length).toBeLessThanOrEqual(3501);
    expect(cuerpo.text.endsWith('…')).toBe(true);
  });

  it('si Telegram rechaza o la red falla devuelve false SIN lanzar y SIN filtrar el token', async () => {
    configurar();
    const aviso = jest.spyOn((servicio as unknown as { log: { warn: (m: string) => void } }).log, 'warn').mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 } as Response);
    expect(await servicio.enviar('x')).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error('ECONNRESET https://api.telegram.org/bot123456:SECRETO-DE-PRUEBA/sendMessage'));
    await expect(servicio.enviar('x')).resolves.toBe(false);
    const registrado = aviso.mock.calls.map(([m]) => m).join('\n');
    expect(registrado).not.toContain('SECRETO-DE-PRUEBA');
    expect(aviso).toHaveBeenCalledTimes(2);
  });

  it('un cuelgue de Telegram se corta por tiempo de espera', async () => {
    configurar();
    jest.useFakeTimers();
    jest.spyOn((servicio as unknown as { log: { warn: (m: string) => void } }).log, 'warn').mockImplementation(() => undefined);
    fetchMock.mockImplementation(
      (_url: unknown, opciones: RequestInit) =>
        new Promise((_resolve, reject) => {
          opciones.signal?.addEventListener('abort', () => reject(Object.assign(new Error('abortado'), { name: 'AbortError' })));
        }),
    );
    const resultado = servicio.enviar('x');
    await jest.advanceTimersByTimeAsync(5001);
    await expect(resultado).resolves.toBe(false);
    jest.useRealTimers();
  });

  it('enviarEnSegundoPlano nunca lanza aunque falle', () => {
    configurar();
    jest.spyOn((servicio as unknown as { log: { warn: (m: string) => void } }).log, 'warn').mockImplementation(() => undefined);
    fetchMock.mockRejectedValue(new Error('caido'));
    expect(() => servicio.enviarEnSegundoPlano('x')).not.toThrow();
  });
});
