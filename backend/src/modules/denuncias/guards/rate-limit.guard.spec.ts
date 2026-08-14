import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitOpciones } from '../decorators/rate-limit.decorator';

/** Contexto minimo: al guard solo le importa la IP y los metadatos de la ruta. */
function contexto(ip: string | undefined): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ ip }) }),
  } as unknown as ExecutionContext;
}

function guardConOpciones(opciones: RateLimitOpciones | undefined) {
  const reflector = { getAllAndOverride: () => opciones } as unknown as Reflector;
  return new RateLimitGuard(reflector);
}

const OPCIONES: RateLimitOpciones = {
  nombre: 'test-crear',
  ventanaMs: 60_000,
  maximo: 3,
  penalizacionMs: 120_000,
};

describe('RateLimitGuard', () => {
  afterEach(() => jest.useRealTimers());

  it('deja pasar cuando la ruta no declara limite', () => {
    const guard = guardConOpciones(undefined);
    for (let i = 0; i < 50; i++) expect(guard.canActivate(contexto('1.1.1.1'))).toBe(true);
  });

  it('permite hasta el maximo y bloquea el siguiente', () => {
    const guard = guardConOpciones(OPCIONES);
    for (let i = 0; i < OPCIONES.maximo; i++) {
      expect(guard.canActivate(contexto('2.2.2.2'))).toBe(true);
    }
    expect(() => guard.canActivate(contexto('2.2.2.2'))).toThrow(HttpException);
  });

  it('responde 429 con un mensaje para una persona, no un error tecnico', () => {
    const guard = guardConOpciones(OPCIONES);
    for (let i = 0; i < OPCIONES.maximo; i++) guard.canActivate(contexto('3.3.3.3'));

    try {
      guard.canActivate(contexto('3.3.3.3'));
      fail('debia bloquear');
    } catch (error) {
      const excepcion = error as HttpException;
      expect(excepcion.getStatus()).toBe(429);
      const cuerpo = excepcion.getResponse() as { message: string };
      expect(cuerpo.message).toContain('varios envíos');
      expect(cuerpo.message).not.toMatch(/rate|limit|exception/i);
    }
  });

  it('aisla el cupo por IP: una IP bloqueada no afecta a otra', () => {
    const guard = guardConOpciones(OPCIONES);
    for (let i = 0; i < OPCIONES.maximo; i++) guard.canActivate(contexto('4.4.4.4'));
    expect(() => guard.canActivate(contexto('4.4.4.4'))).toThrow(HttpException);

    expect(guard.canActivate(contexto('5.5.5.5'))).toBe(true);
  });

  it('libera el cupo cuando la ventana y la penalizacion vencen', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-14T10:00:00Z'));
    const guard = guardConOpciones(OPCIONES);

    for (let i = 0; i < OPCIONES.maximo; i++) guard.canActivate(contexto('6.6.6.6'));
    expect(() => guard.canActivate(contexto('6.6.6.6'))).toThrow(HttpException);

    // sigue bloqueada mientras corre la penalizacion
    jest.setSystemTime(new Date('2026-08-14T10:01:00Z'));
    expect(() => guard.canActivate(contexto('6.6.6.6'))).toThrow(HttpException);

    // vencidas la penalizacion y la ventana, vuelve a poder denunciar
    jest.setSystemTime(new Date('2026-08-14T10:05:00Z'));
    expect(guard.canActivate(contexto('6.6.6.6'))).toBe(true);
  });

  it('trata las solicitudes sin IP como un mismo cupo en vez de dejarlas libres', () => {
    const guard = guardConOpciones(OPCIONES);
    for (let i = 0; i < OPCIONES.maximo; i++) expect(guard.canActivate(contexto(undefined))).toBe(true);
    expect(() => guard.canActivate(contexto(undefined))).toThrow(HttpException);
  });

  it('no comparte cupo entre endpoints con nombres distintos', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValueOnce({ ...OPCIONES, nombre: 'crear' })
        .mockReturnValueOnce({ ...OPCIONES, nombre: 'crear' })
        .mockReturnValueOnce({ ...OPCIONES, nombre: 'crear' })
        .mockReturnValueOnce({ ...OPCIONES, nombre: 'catalogos' }),
    } as unknown as Reflector;
    const guard = new RateLimitGuard(reflector);

    for (let i = 0; i < OPCIONES.maximo; i++) guard.canActivate(contexto('7.7.7.7'));
    // mismo IP, otro endpoint: cupo propio
    expect(guard.canActivate(contexto('7.7.7.7'))).toBe(true);
  });
});
