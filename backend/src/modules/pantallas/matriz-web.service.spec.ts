import { Controller, Delete, ForbiddenException, Get } from '@nestjs/common';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { Pantalla, PantallaPermiso } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CatalogoWeb, MatrizWebService } from './matriz-web.service';

@Controller('demo')
@RequirePermission('demo:ver')
class DemoController {
  @Get() listar() { return []; }
  @Get(':id') uno() { return {}; }
  @Delete(':id') @RequirePermission('demo:eliminar') borrar() { return {}; }
}

@Controller('pantallas')
class PantallasDemo {
  @Get('reglas') reglas() { return []; }
}

const catalogo: CatalogoWeb = {
  pantallas: [
    { codigo: '0xB101', ruta: '/dashboard/demo', nombre: 'Demo', modulo: 'demo', prefijo: 'demo:', llamadas: [
      { metodos: ['GET'], patron: '/demo' }, { metodos: ['DELETE'], patron: '/demo/*' }, { metodos: ['GET'], patron: '/pantallas/reglas' },
    ] },
    { codigo: '0xB102', ruta: '/dashboard/otra', nombre: 'Otra', modulo: 'demo', prefijo: 'demo:', llamadas: [{ metodos: ['GET'], patron: '/demo' }] },
  ],
  forzadas: [],
  sinResolver: 0,
};

const discovery = { getControllers: () => [DemoController, PantallasDemo].map((C) => ({ instance: new C(), metatype: C })) };
const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
const moduleRef = { get: jest.fn(() => auditoria) };
const user = { id: 'u1', permisos: ['demo:ver', 'demo:eliminar'] };

async function nueva(base: BaseFalsa) {
  const s = new MatrizWebService(discovery as never, new MetadataScanner(), moduleRef as never, base as never, catalogo);
  await s.onApplicationBootstrap();
  return s;
}

function regla(base: BaseFalsa, o: Partial<PantallaPermiso>) {
  return base.getRepository(PantallaPermiso as never).save(Object.assign(new PantallaPermiso(), {
    pantallaCodigo: '0xB101', sujetoTipo: 'USUARIO', sujetoId: 'u1', ver: false, crear: false, editar: false,
    eliminar: false, confidencial: false, denegar: false, creadoPor: null, actualizadoEn: new Date(), ...o,
  }) as never);
}

describe('MatrizWebService', () => {
  let base: BaseFalsa;
  beforeEach(() => { base = new BaseFalsa(); auditoria.registrar.mockClear(); });

  it('lee las rutas reales de los controladores con el permiso de cada una', async () => {
    const s = await nueva(base);
    const demo = s.catalogoParaAdministrar().pantallas.find((p) => p.codigo === '0xB101')!;
    expect(demo.rutasApi).toEqual(expect.arrayContaining([
      { metodo: 'GET', patron: '/demo', permisos: ['demo:ver'], exenta: false },
      { metodo: 'DELETE', patron: '/demo/:id', permisos: ['demo:eliminar'], exenta: false },
      { metodo: 'GET', patron: '/pantallas/reglas', permisos: [], exenta: true },
    ]));
    expect(s.estado()).toMatchObject({ activa: true, sincronizada: true, rutasBackend: 4 });
  });

  it('sin reglas configuradas no cambia nada', async () => {
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
  });

  it('una regla que concede ver pero no eliminar devuelve 403 con el nombre de la pantalla, y audita una sola vez', async () => {
    await regla(base, { ver: true });
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toThrow(/eliminar en «Demo»/);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
    expect(auditoria.registrar).toHaveBeenCalledTimes(1);
    await expect(s.exigirEnRuta(user, 'GET', '/api/v1/demo/:id')).resolves.toBeUndefined();
  });

  it('una ruta compartida sigue disponible si otra pantalla la permite', async () => {
    await regla(base, { denegar: true });
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'GET', '/api/v1/demo')).resolves.toBeUndefined();
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('administrar la matriz nunca queda bloqueado por la matriz', async () => {
    await regla(base, { denegar: true });
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'GET', '/api/v1/pantallas/reglas')).resolves.toBeUndefined();
  });

  it('las reglas se leen de un caché que se invalida al guardar', async () => {
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
    await regla(base, { denegar: true });
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
    s.invalidar();
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sincroniza seguridad.pantallas: da de alta, desactiva las web que ya no están y no toca las de la app', async () => {
    const repo = base.getRepository(Pantalla as never);
    await repo.save(Object.assign(new Pantalla(), { codigo: '0xA001', nombre: 'App', descripcion: null, confidencialAplica: false, activa: true }) as never);
    await repo.save(Object.assign(new Pantalla(), { codigo: '0xB999', nombre: 'Vieja', descripcion: null, confidencialAplica: false, activa: true }) as never);
    await nueva(base);
    const filas = base.tabla('Pantalla') as Array<{ codigo: string; activa: boolean; nombre: string }>;
    const por = new Map(filas.map((f) => [f.codigo, f]));
    expect(por.get('0xB101')).toMatchObject({ nombre: 'Demo', activa: true });
    expect(por.get('0xB999')!.activa).toBe(false);
    expect(por.get('0xA001')!.activa).toBe(true);
    expect(por.get('0xC003')).toMatchObject({ activa: true });
  });

  it('decide lo que ofrece la interfaz', async () => {
    const s = await nueva(base);
    const sinEliminar = await s.misPermisosWeb({ id: 'u1', permisos: ['demo:ver'] });
    expect(sinEliminar.pantallas.find((p) => p.codigo === '0xB101')).toMatchObject({ ver: true, eliminar: false, crear: false });
    await regla(base, { denegar: true });
    s.invalidar();
    const negada = await s.misPermisosWeb({ id: 'u1', permisos: ['demo:ver'] });
    expect(negada.pantallas.find((p) => p.codigo === '0xB101')!.ver).toBe(false);
    expect(negada.pantallas.find((p) => p.codigo === '0xB102')!.ver).toBe(true);
  });

  it('evalúa las secciones del Centro de mando con su permiso base y las reglas', async () => {
    const s = await nueva(base);
    const puede = await s.evaluadorSecciones({ id: 'u1', permisos: ['servicios:ver'] });
    expect(puede('alertas')).toBe(true);
    expect(puede('sistema')).toBe(false);
    expect(puede('mi_actividad')).toBe(true);
    await regla(base, { pantallaCodigo: '0xC004', denegar: true });
    s.invalidar();
    expect((await s.evaluadorSecciones({ id: 'u1', permisos: ['servicios:ver'] }))('alertas')).toBe(false);
  });
});

describe('PermissionsGuard con la matriz', () => {
  const contexto = (permisos: string[]) => ({
    getHandler: () => DemoController.prototype.borrar,
    getClass: () => DemoController,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u1', permisos }, method: 'DELETE', route: { path: '/api/v1/demo/:id' } }) }),
  });

  it('primero exige el permiso por rol (síncrono, como antes)', async () => {
    const s = await nueva(new BaseFalsa());
    const guard = new PermissionsGuard(new Reflector(), s);
    expect(() => guard.canActivate(contexto(['demo:ver']) as never)).toThrow(/Permiso insuficiente/);
  });

  it('después aplica la matriz', async () => {
    const b = new BaseFalsa();
    await regla(b, { ver: true });
    const guard = new PermissionsGuard(new Reflector(), await nueva(b));
    await expect(guard.canActivate(contexto(['demo:ver', 'demo:eliminar']) as never)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sin el servicio de la matriz se comporta exactamente como antes', () => {
    const guard = new PermissionsGuard(new Reflector());
    expect(guard.canActivate(contexto(['demo:eliminar']) as never)).toBe(true);
  });
});
