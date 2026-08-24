import { RolesService } from './roles.service';

describe('RolesService', () => {
  const contexto = { actorId: 'autoridad-1', ip: '127.0.0.1', userAgent: 'jest' };
  let asignacionRolRepo: { find: jest.Mock; count: jest.Mock };
  let sesionesService: { cerrarTodas: jest.Mock };
  let service: RolesService;

  beforeEach(() => {
    asignacionRolRepo = { find: jest.fn(), count: jest.fn() };
    sesionesService = { cerrarTodas: jest.fn().mockResolvedValue(1) };
    service = new RolesService(
      { findOne: jest.fn().mockResolvedValue({ id: 'rol-1', activo: true }), update: jest.fn() } as any,
      {} as any,
      asignacionRolRepo as any,
      {} as any,
      { registrar: jest.fn().mockResolvedValue(undefined) } as any,
      sesionesService as any,
    );
  });

  it('invalida una sola vez las sesiones de cada usuario que tenga el rol', async () => {
    asignacionRolRepo.find.mockResolvedValue([
      { usuarioId: 'usuario-1' },
      { usuarioId: 'usuario-1' },
      { usuarioId: 'usuario-2' },
    ]);

    await (service as any).cerrarSesionesDeRol('rol-1');

    expect(sesionesService.cerrarTodas).toHaveBeenCalledTimes(2);
    expect(sesionesService.cerrarTodas).toHaveBeenCalledWith('usuario-1');
    expect(sesionesService.cerrarTodas).toHaveBeenCalledWith('usuario-2');
  });

  it('invalida sesiones cuando se desactiva un rol', async () => {
    asignacionRolRepo.find.mockResolvedValue([{ usuarioId: 'usuario-1' }]);

    await service.activar('rol-1', false, contexto);

    expect(sesionesService.cerrarTodas).toHaveBeenCalledWith('usuario-1');
  });
});
