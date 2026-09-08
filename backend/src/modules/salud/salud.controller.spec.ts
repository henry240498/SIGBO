import { ServiceUnavailableException } from '@nestjs/common';
import { SaludController } from './salud.controller';

describe('SaludController', () => {
  it('confirma disponibilidad solo cuando la base responde', async () => {
    const controller = new SaludController({ query: jest.fn().mockResolvedValue([{ disponible: 1 }]) } as any);
    await expect(controller.comprobar()).resolves.toMatchObject({ estado: 'disponible' });
  });

  it('no expone el error interno cuando la base no responde', async () => {
    const controller = new SaludController({ query: jest.fn().mockRejectedValue(new Error('detalle interno')) } as any);
    await expect(controller.comprobar()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
