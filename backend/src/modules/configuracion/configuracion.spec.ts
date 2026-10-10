import { BadRequestException } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';

const CLAVE = 'operations.commandCenterStates';

describe('ConfiguracionService, listas', () => {
  const servicio = (fila: unknown = null) =>
    new ConfiguracionService({ findOne: jest.fn().mockResolvedValue(fila) } as never, {} as never, {} as never, {} as never);

  it('validar rechaza lo que no es una lista, lo no permitido y la lista vacía', () => {
    const s = servicio();
    expect(() => s.validar({ [CLAVE]: 'ACTIVO' }, false)).toThrow(BadRequestException);
    expect(() => s.validar({ [CLAVE]: ['ACTIVO', 'INEXISTENTE'] }, false)).toThrow(BadRequestException);
    expect(() => s.validar({ [CLAVE]: [] }, false)).toThrow(BadRequestException);
    try { s.validar({ [CLAVE]: [] }, false); } catch (e) { expect(JSON.stringify((e as BadRequestException).getResponse())).toContain('Elegí al menos un estado.'); }
  });

  it('validar acepta una lista de valores permitidos', () => {
    expect(() => servicio().validar({ [CLAVE]: ['ACTIVO', 'LICENCIA'] }, false)).not.toThrow();
  });

  it('valorGlobal devuelve el valor por defecto si no hay fila GLOBAL, y el publicado si la hay', async () => {
    await expect(servicio().valorGlobal<string[]>(CLAVE)).resolves.toEqual(['ACTIVO']);
    await expect(servicio({ valorJson: '["ACTIVO","LICENCIA"]' }).valorGlobal<string[]>(CLAVE)).resolves.toEqual(['ACTIVO', 'LICENCIA']);
    await expect(servicio().valorGlobal('no.existe')).rejects.toThrow('desconocida');
  });
});
