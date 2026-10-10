import { Controller, Delete, ForbiddenException, Get, Patch } from '@nestjs/common';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { Pantalla, PantallaPermiso } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CentroMandoController } from '../centro-mando/centro-mando.controller';
import { SistemaController } from '../sistema/sistema.controller';
import { PANTALLAS_WEB } from './catalogo-web.generado';
import { CatalogoWeb, MatrizWebService } from './matriz-web.service';
import { PantallasController } from './pantallas.controller';

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
      { metodo: 'GET', patron: '/demo', permisos: ['demo:ver'], exenta: false, compartidaCon: 1 },
      { metodo: 'DELETE', patron: '/demo/:id', permisos: ['demo:eliminar'], exenta: false, compartidaCon: 0 },
      { metodo: 'GET', patron: '/pantallas/reglas', permisos: [], exenta: true, compartidaCon: 0 },
    ]));
    expect(s.estado()).toMatchObject({ activa: true, sincronizada: true, rutasBackend: 4 });
  });

  it('informa con cuántas otras pantallas comparte cada ruta (denegar esta no la bloquea si otra la permite)', async () => {
    const s = await nueva(base);
    const otra = s.catalogoParaAdministrar().pantallas.find((p) => p.codigo === '0xB102')!;
    expect(otra.rutasApi).toEqual([{ metodo: 'GET', patron: '/demo', permisos: ['demo:ver'], exenta: false, compartidaCon: 1 }]);
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

  it('una regla sobre el Centro de mando (0xC001) niega su acceso: denegar, o reglas que no conceden ver', async () => {
    const s = await nueva(base);
    await expect(s.reglaNiegaVer('u1', '0xC001')).resolves.toBe(false);
    await regla(base, { pantallaCodigo: '0xC001', denegar: true });
    s.invalidar();
    await expect(s.reglaNiegaVer('u1', '0xC001')).resolves.toBe(true);
    await expect(s.reglaNiegaVer('otro', '0xC001')).resolves.toBe(false);
    await expect(s.reglaNiegaVer('u1', '0xB101')).resolves.toBe(false);
  });

  it('una regla que concede ver no niega el Centro de mando; una que no lo concede, sí', async () => {
    await regla(base, { pantallaCodigo: '0xC001', ver: true });
    const s = await nueva(base);
    await expect(s.reglaNiegaVer('u1', '0xC001')).resolves.toBe(false);
    const b2 = new BaseFalsa();
    await regla(b2, { pantallaCodigo: '0xC001', crear: true });
    await expect((await nueva(b2)).reglaNiegaVer('u1', '0xC001')).resolves.toBe(true);
  });
});

describe('MatrizWebService con el catálogo generado y los controladores reales del área Sistema', () => {
  it('Registros exige sistema:ver_registros; Estado, Tareas, Datos y App móvil exigen sistema:ver (las rutas exentas no abren la pantalla)', async () => {
    const controladores = [SistemaController, PantallasController, CentroMandoController];
    const descubrimiento = { getControllers: () => controladores.map((C) => ({ instance: Object.create(C.prototype), metatype: C })) };
    const sistema: CatalogoWeb = { pantallas: PANTALLAS_WEB.filter((p) => p.modulo === 'sistema'), forzadas: [], sinResolver: 0 };
    const s = new MatrizWebService(descubrimiento as never, new MetadataScanner(), moduleRef as never, new BaseFalsa() as never, sistema);
    await s.onApplicationBootstrap();
    const ver = async (permisos: string[]) => Object.fromEntries((await s.misPermisosWeb({ id: 'u1', permisos })).pantallas.map((p) => [p.ruta, p.ver]));
    expect(await ver(['sistema:ver_registros'])).toEqual({
      '/dashboard/sistema': false, '/dashboard/sistema/app-movil': false, '/dashboard/sistema/datos': false,
      '/dashboard/sistema/registros': true, '/dashboard/sistema/tareas': false,
    });
    expect(await ver(['sistema:ver'])).toEqual({
      '/dashboard/sistema': true, '/dashboard/sistema/app-movil': true, '/dashboard/sistema/datos': true,
      '/dashboard/sistema/registros': false, '/dashboard/sistema/tareas': true,
    });
    expect(Object.values(await ver(['sistema:operar'])).some(Boolean)).toBe(false);
  });
});

/** Hace fallar las lecturas de una entidad, sin tocar las demás. */
function fallar(base: BaseFalsa, entidad: unknown, activo: { on: boolean }) {
  const original = base.getRepository.bind(base);
  jest.spyOn(base, 'getRepository').mockImplementation(((e: unknown) => {
    if (e === entidad && activo.on) {
      return { find: async () => { throw new Error('base caída'); }, save: async () => { throw new Error('base caída'); } } as never;
    }
    return original(e as never);
  }) as never);
}

describe('MatrizWebService ante fallas', () => {
  let base: BaseFalsa;
  beforeEach(() => { base = new BaseFalsa(); auditoria.registrar.mockClear(); jest.restoreAllMocks(); });

  it('si la sincronización falla, la matriz no bloquea a nadie, y una sincronización posterior la reactiva', async () => {
    await regla(base, { denegar: true });
    const falla = { on: true };
    fallar(base, Pantalla, falla);
    const s = await nueva(base);
    expect(s.estaSincronizada()).toBe(false);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
    falla.on = false;
    await s.sincronizar();
    expect(s.estaSincronizada()).toBe(true);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('si no se pueden leer las reglas y nunca se leyeron, el pedido pasa', async () => {
    const falla = { on: false };
    fallar(base, PantallaPermiso, falla);
    const s = await nueva(base);
    falla.on = true;
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
  });

  it('si no se pueden leer las reglas, el Centro de mando no queda negado (falla abierta)', async () => {
    const falla = { on: false };
    fallar(base, PantallaPermiso, falla);
    const s = await nueva(base);
    falla.on = true;
    await expect(s.reglaNiegaVer('u1', '0xC001')).resolves.toBe(false);
  });

  it('si no se pueden leer las reglas pero hay unas previas, se usan', async () => {
    await regla(base, { denegar: true });
    const falla = { on: false };
    fallar(base, PantallaPermiso, falla);
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
    s.invalidar();
    falla.on = true;
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('PermissionsGuard con la matriz', () => {
  const contexto = (permisos: string[], cabeceras: Record<string, string> = {}) => ({
    getHandler: () => DemoController.prototype.borrar,
    getClass: () => DemoController,
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: 'u1', permisos }, method: 'DELETE', route: { path: '/api/v1/demo/:id' },
        headers: cabeceras, get: (n: string) => cabeceras[n.toLowerCase()],
      }),
    }),
  });

  it('la app móvil (cabecera de dispositivo, sin cookies ni Origin) no queda bajo las reglas web en las rutas que ella usa', async () => {
    @Controller('alertas')
    class AlertasDemo { @Patch(':id/estado') @RequirePermission('demo:ver') cambiar() { return {}; } }
    const b = new BaseFalsa();
    await regla(b, { pantallaCodigo: '0xB201', ver: true });
    const s = new MatrizWebService(
      { getControllers: () => [{ instance: new AlertasDemo(), metatype: AlertasDemo }] } as never, new MetadataScanner(), moduleRef as never, b as never,
      { pantallas: [{ codigo: '0xB201', ruta: '/dashboard/x', nombre: 'X', modulo: 'x', prefijo: null, llamadas: [{ metodos: ['PATCH'], patron: '/alertas/*/estado' }] }], forzadas: [], sinResolver: 0 },
    );
    await s.onApplicationBootstrap();
    const guard = new PermissionsGuard(new Reflector(), s);
    const pedido = (cabeceras: Record<string, string>) => ({
      getHandler: () => AlertasDemo.prototype.cambiar, getClass: () => AlertasDemo,
      switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u1', permisos: ['demo:ver'] }, method: 'PATCH', route: { path: '/api/v1/alertas/:id/estado' }, headers: cabeceras, get: (n: string) => cabeceras[n.toLowerCase()] }) }),
    });
    const movil = { 'x-sigbo-dispositivo': 'movil' };
    expect(guard.canActivate(pedido(movil) as never)).toBe(true);
    await expect(guard.canActivate(pedido({ ...movil, origin: 'http://localhost:3000' }) as never)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('fuera de las rutas de la app, el cliente nativo pasa por la matriz web como cualquiera', async () => {
    const b = new BaseFalsa();
    await regla(b, { ver: true });
    const guard = new PermissionsGuard(new Reflector(), await nueva(b));
    const movil = { 'x-sigbo-dispositivo': 'movil' };
    await expect(guard.canActivate(contexto(['demo:ver', 'demo:eliminar'], movil) as never)).rejects.toBeInstanceOf(ForbiddenException);
    // sin reglas configuradas no cambia nada
    const libre = new PermissionsGuard(new Reflector(), await nueva(new BaseFalsa()));
    await expect(libre.canActivate(contexto(['demo:ver', 'demo:eliminar'], movil) as never)).resolves.toBe(true);
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
