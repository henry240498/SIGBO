import { MAX_ATRASO_MS, instanteDelHecho } from './instante';

describe('instanteDelHecho', () => {
  const ahora = new Date('2026-03-10T12:00:00Z');
  const hace = (min: number) => new Date(ahora.getTime() - min * 60_000).toISOString();

  it('acepta la hora del hecho si es pasada y reciente', () => {
    expect(instanteDelHecho(hace(30), ahora).toISOString()).toBe(hace(30));
  });
  it('sin valor, invalido o futuro usa la hora del servidor', () => {
    expect(instanteDelHecho(undefined, ahora)).toEqual(ahora);
    expect(instanteDelHecho('no es fecha', ahora)).toEqual(ahora);
    expect(instanteDelHecho(new Date(ahora.getTime() + 60_000).toISOString(), ahora)).toEqual(ahora);
  });
  it('un reloj muy atrasado (mas de 72 h) no reescribe el pasado', () => {
    expect(instanteDelHecho(new Date(ahora.getTime() - MAX_ATRASO_MS - 1).toISOString(), ahora)).toEqual(ahora);
    expect(instanteDelHecho(new Date(ahora.getTime() - MAX_ATRASO_MS).toISOString(), ahora)).not.toEqual(ahora);
  });
  it('nunca queda antes del hito anterior', () => {
    const previo = new Date(hace(10));
    expect(instanteDelHecho(hace(60), ahora, previo)).toEqual(previo);
    expect(instanteDelHecho(hace(5), ahora, previo).toISOString()).toBe(hace(5));
  });
  it('si el hito anterior es del futuro, se acota a ahora', () => {
    expect(instanteDelHecho(hace(5), ahora, new Date(ahora.getTime() + 3_600_000))).toEqual(ahora);
  });
});
