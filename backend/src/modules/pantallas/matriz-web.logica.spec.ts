import type { PantallaPermiso } from '../../shared/entities';
import {
  accionDe, baseDePantalla, construirIndice, decidirApi, decidirUi, decidirUiDetalle, esExenta,
  PantallaCatalogo, resolverLlamada, RutaBackend, sinPrefijo,
} from './matriz-web.logica';
import type { SujetoUsuario } from './pantallas.logica';

const sujeto: SujetoUsuario = { usuarioId: 'u1', rolIds: ['rolA'], rangoId: 'r1', cargo: 'Jefe' };
const regla = (o: Partial<PantallaPermiso>): PantallaPermiso => ({
  id: 'x', pantallaCodigo: '0xB001', sujetoTipo: 'USUARIO', sujetoId: 'u1', ver: false, crear: false, editar: false,
  eliminar: false, confidencial: false, denegar: false, creadoPor: null, creadoEn: new Date(), actualizadoEn: new Date(), ...o,
}) as PantallaPermiso;

const rutas: RutaBackend[] = [
  { metodo: 'GET', patron: '/personal/bomberos', permisos: ['personal:ver'] },
  { metodo: 'GET', patron: '/personal/bomberos/:id', permisos: ['personal:ver'] },
  { metodo: 'GET', patron: '/personal/bomberos/exportar', permisos: ['personal:exportar'] },
  { metodo: 'DELETE', patron: '/personal/bomberos/:id', permisos: ['personal:eliminar'] },
  { metodo: 'PUT', patron: '/pantallas/reglas', permisos: ['seguridad:gestionar_pantallas'] },
  { metodo: 'GET', patron: '/seguridad/mi-inicio', permisos: [] },
];

const personal: PantallaCatalogo = {
  codigo: '0xB001', ruta: '/dashboard/personal', nombre: 'Personal', modulo: 'personal', prefijo: 'personal:',
  llamadas: [{ metodos: ['GET'], patron: '/personal/bomberos' }, { metodos: ['DELETE'], patron: '/personal/bomberos/*' }],
};
const guardias: PantallaCatalogo = {
  codigo: '0xB002', ruta: '/dashboard/guardias', nombre: 'Guardias', modulo: 'guardias', prefijo: 'guardias:',
  llamadas: [{ metodos: ['GET'], patron: '/personal/bomberos' }],
};
const reglasPantallas: PantallaCatalogo = {
  codigo: '0xB003', ruta: '/dashboard/seguridad/pantallas', nombre: 'Pantallas', modulo: 'seguridad', prefijo: 'seguridad:',
  llamadas: [{ metodos: ['PUT'], patron: '/pantallas/reglas' }, { metodos: ['GET'], patron: '/no/existe' }],
};

describe('rutas y llamadas', () => {
  it('quita el prefijo global del patrón de Express', () => {
    expect(sinPrefijo('/api/v1/personal/bomberos/:id')).toBe('/personal/bomberos/:id');
    expect(sinPrefijo('api/v1//salud/')).toBe('/salud');
  });

  it('un comodín prefiere la ruta con parámetro; un literal, la ruta literal', () => {
    expect(resolverLlamada({ metodos: ['GET'], patron: '/personal/bomberos/*' }, rutas).map((r) => r.patron)).toEqual(['/personal/bomberos/:id']);
    expect(resolverLlamada({ metodos: ['GET'], patron: '/personal/bomberos/exportar' }, rutas).map((r) => r.patron)).toEqual(['/personal/bomberos/exportar']);
  });

  it('si no hay coincidencia exacta, acepta la flexible (literal contra parámetro)', () => {
    expect(resolverLlamada({ metodos: ['DELETE'], patron: '/personal/bomberos/abc' }, rutas).map((r) => r.patron)).toEqual(['/personal/bomberos/:id']);
  });

  it('respeta el método', () => {
    expect(resolverLlamada({ metodos: ['POST'], patron: '/personal/bomberos' }, rutas)).toEqual([]);
  });
});

describe('índice', () => {
  const indice = construirIndice([personal, guardias, reglasPantallas], rutas);

  it('una ruta compartida queda asociada a todas sus pantallas', () => {
    expect(indice.pantallasPorRuta.get('GET /personal/bomberos')).toEqual(['0xB001', '0xB002']);
    expect(indice.pantallasPorRuta.get('DELETE /personal/bomberos/:id')).toEqual(['0xB001']);
  });

  it('las rutas exentas no entran al índice: administrar la matriz nunca se bloquea con la matriz', () => {
    expect(esExenta('/pantallas/reglas/:id')).toBe(true);
    expect(esExenta('/seguridad/mi-inicio')).toBe(true);
    expect(esExenta('/personal/bomberos')).toBe(false);
    expect(indice.pantallasPorRuta.has('PUT /pantallas/reglas')).toBe(false);
    // pero la pantalla conoce su ruta, para calcular su permiso base
    expect(indice.rutasPorPantalla.get('0xB003')!.map((r) => r.patron)).toEqual(['/pantallas/reglas']);
  });

  it('informa las llamadas que no corresponden a ninguna ruta', () => {
    expect(indice.sinResolver).toEqual([{ codigo: '0xB003', llamada: { metodos: ['GET'], patron: '/no/existe' } }]);
  });
});

describe('acción por método', () => {
  it('GET ver, POST crear, PUT/PATCH editar, DELETE eliminar, salvo acción forzada', () => {
    expect(accionDe('GET', '/x', [])).toBe('ver');
    expect(accionDe('HEAD', '/x', [])).toBe('ver');
    expect(accionDe('POST', '/x', [])).toBe('crear');
    expect(accionDe('PATCH', '/x', [])).toBe('editar');
    expect(accionDe('DELETE', '/x', [])).toBe('eliminar');
    expect(accionDe('POST', '/finanzas/beneficios/simular', [{ metodo: 'POST', patron: '/finanzas/beneficios/simular', accion: 'ver' }])).toBe('ver');
    expect(accionDe('OPTIONS', '/x', [])).toBeNull();
  });
});

describe('decidirApi', () => {
  it('sin pantallas o sin reglas aplicables, permite (el rol ya se exigió)', () => {
    expect(decidirApi([], 'ver', [], sujeto).permitido).toBe(true);
    expect(decidirApi(['0xB001'], 'ver', [], sujeto).permitido).toBe(true);
    expect(decidirApi(['0xB001'], 'ver', [regla({ sujetoId: 'otro', denegar: true })], sujeto).permitido).toBe(true);
  });

  it('denegar gana y se informa qué pantalla lo negó', () => {
    expect(decidirApi(['0xB001'], 'ver', [regla({ ver: true }), regla({ id: 'y', sujetoTipo: 'ROL', sujetoId: 'rolA', denegar: true })], sujeto))
      .toEqual({ permitido: false, codigoDenegado: '0xB001' });
  });

  it('una regla que concede ver no concede eliminar', () => {
    expect(decidirApi(['0xB001'], 'eliminar', [regla({ ver: true })], sujeto).permitido).toBe(false);
  });

  it('una ruta compartida sigue disponible si otra pantalla la permite', () => {
    expect(decidirApi(['0xB001', '0xB002'], 'ver', [regla({ denegar: true })], sujeto).permitido).toBe(true);
  });
});

describe('decisión para la interfaz', () => {
  const r = construirIndice([personal], rutas).rutasPorPantalla.get('0xB001')!;

  it('ver exige el prefijo del módulo y alguno de los permisos de sus GET', () => {
    const base = baseDePantalla(personal, r, 'ver', []);
    expect(decidirUi(base, 'ver', ['personal:ver'], [], sujeto)).toBe(true);
    expect(decidirUi(base, 'ver', ['guardias:ver'], [], sujeto)).toBe(false);
    expect(decidirUi(base, 'ver', ['personal:crear'], [], sujeto)).toBe(false);
  });

  it('una acción sin rutas de ese método no se ofrece', () => {
    expect(baseDePantalla(personal, r, 'crear', []).nunca).toBe(true);
    expect(decidirUi(baseDePantalla(personal, r, 'crear', []), 'crear', ['personal:crear'], [], sujeto)).toBe(false);
  });

  it('una ruta abierta (sin permiso) no exige permiso, solo el prefijo', () => {
    const p: PantallaCatalogo = { ...personal, codigo: '0xB009', llamadas: [{ metodos: ['GET'], patron: '/seguridad/mi-inicio' }] };
    const rr = construirIndice([p], rutas).rutasPorPantalla.get('0xB009')!;
    expect(decidirUi(baseDePantalla(p, rr, 'ver', []), 'ver', ['personal:editar'], [], sujeto)).toBe(true);
  });

  it('las reglas restringen e informan el origen', () => {
    const base = baseDePantalla(personal, r, 'ver', []);
    expect(decidirUiDetalle(base, 'ver', ['personal:ver'], [regla({ denegar: true })], sujeto)).toEqual({ permitido: false, origen: 'REGLA' });
    expect(decidirUiDetalle(base, 'ver', ['personal:ver'], [regla({ ver: true })], sujeto)).toEqual({ permitido: true, origen: 'REGLA' });
    expect(decidirUiDetalle(base, 'ver', ['personal:ver'], [], sujeto)).toEqual({ permitido: true, origen: 'ROL' });
    expect(decidirUiDetalle(base, 'ver', [], [regla({ ver: true })], sujeto)).toEqual({ permitido: false, origen: 'ROL' });
  });
});
