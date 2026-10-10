import { esRutaDeAppMovil } from './rutas-app-movil';

describe('rutas de la API que usa la app móvil', () => {
  it('los módulos que la app usa entran con cualquier método y sus subrutas', () => {
    expect(esRutaDeAppMovil('GET', '/despacho/solicitudes/mias')).toBe(true);
    expect(esRutaDeAppMovil('PATCH', '/despacho/servicios/:id/mi-estado')).toBe(true);
    expect(esRutaDeAppMovil('PATCH', '/alertas/:id/estado')).toBe(true);
    expect(esRutaDeAppMovil('POST', '/flota/moviles/:id/posicion')).toBe(true);
    expect(esRutaDeAppMovil('GET', '/app-movil/version')).toBe(true);
  });

  it('las rutas sueltas exigen método y patrón exactos', () => {
    expect(esRutaDeAppMovil('GET', '/personal/bomberos')).toBe(true);
    expect(esRutaDeAppMovil('HEAD', '/personal/bomberos')).toBe(true);
    expect(esRutaDeAppMovil('DELETE', '/personal/bomberos/:id')).toBe(false);
    expect(esRutaDeAppMovil('PUT', '/personal/bomberos/:id/firma-digital')).toBe(false);
    expect(esRutaDeAppMovil('GET', '/seguridad/auditoria')).toBe(true);
    expect(esRutaDeAppMovil('POST', '/fichaje/escanear')).toBe(true);
    expect(esRutaDeAppMovil('POST', '/fichaje/puntos')).toBe(false);
  });

  it('el resto de la API no es de la app (un prefijo no se confunde con otro que empieza igual)', () => {
    expect(esRutaDeAppMovil('GET', '/sistema/registros')).toBe(false);
    expect(esRutaDeAppMovil('POST', '/seguridad/usuarios')).toBe(false);
    expect(esRutaDeAppMovil('GET', '/finanzas/movimientos')).toBe(false);
    expect(esRutaDeAppMovil('GET', '/despachos-viejos')).toBe(false);
    expect(esRutaDeAppMovil('GET', '/pantallas/mis-permisos-web')).toBe(false);
  });
});
