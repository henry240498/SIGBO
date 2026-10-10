import { compararMigraciones, parsearManifiesto } from './migraciones.logica';
import { contenidoQrConexion, direccionesDeRed } from './red.logica';
import { esClaveRegistro, nivelDeLinea, ocultarSecretos, ultimasLineas } from './registros.logica';
import { alertasRespaldo, fechaDeRespaldo, parsearRegistro, validarNombreRespaldo } from './respaldos.logica';
import { describirResultado, esTareaWindows, parsearTareas, SCRIPT_CONSULTA_TAREAS, scriptIniciarTarea } from './tareas.logica';

const REGISTRO = [
  '[1/5] Respaldando sigbo_cbvc ...',
  '[2/5] Verificando integridad (VERIFYONLY + CHECKSUM) ...',
  '[3/5] Copiando al equipo y calculando SHA-256 ...',
  '[4/5] (omitido) Use -ProbarRestauracion para restaurar de prueba.',
  '[5/5] Retencion: se conservan los ultimos 14 respaldos ...',
  '',
  'Respaldo listo: C:\\Proyectos\\Personal\\SIGBO\\respaldos\\sigbo_cbvc-20261008-081341.bak (18 MB)',
  'SHA-256: 85D4D2339EF40DE3DED8B7436F03A7ECA5ECEBB0CE6AE31143258330899ABD0C',
  '',
  'RESULTADO: OK',
  '[1/5] Respaldando sigbo_cbvc ...',
  '[4/5] Restaurando de prueba ...',
  'Restauracion correcta: 312 tablas',
  'AVISO: no se pudo copiar a la ubicacion externa',
  'RESULTADO: FALLO',
  '[1/5] Respaldando sigbo_cbvc ...',
].join('\r\n');

describe('respaldos', () => {
  it('lee cada corrida del registro real', () => {
    const c = parsearRegistro(REGISTRO);
    expect(c).toHaveLength(3);
    expect(c[0]).toMatchObject({ archivo: 'sigbo_cbvc-20261008-081341.bak', tamanio: '18 MB', resultado: 'OK', pruebaRestauracion: 'OMITIDA' });
    expect(c[0].sha256).toBe('85d4d2339ef40de3ded8b7436f03a7eca5ecebb0ce6ae31143258330899abd0c');
    expect(c[1]).toMatchObject({ resultado: 'FALLO', pruebaRestauracion: 'OK', detalleRestauracion: '312 tablas', avisos: ['AVISO: no se pudo copiar a la ubicacion externa'] });
    expect(c[2].resultado).toBe('INCOMPLETA');
  });

  it('solo acepta nombres de respaldo exactos: nada de rutas', () => {
    expect(validarNombreRespaldo('sigbo_cbvc-20261009-082934.bak')).toBe(true);
    for (const malo of ['..\\..\\backend\\.env', 'sigbo_cbvc-20261009-082934.bak/../x', '../sigbo_cbvc-20261009-082934.bak',
      'sigbo_cbvc-20261009-082934.bak.sha256', 'otra-20261009-082934.bak', '', null, 42]) {
      expect(validarNombreRespaldo(malo)).toBe(false);
    }
  });

  it('la fecha sale del nombre, en hora local', () => {
    expect(fechaDeRespaldo('sigbo_cbvc-20261009-082934.bak')).toBe('2026-10-09T08:29:34');
    expect(fechaDeRespaldo('x.bak')).toBeNull();
  });

  it('devuelve null para fechas imposibles', () => {
    expect(fechaDeRespaldo('sigbo_cbvc-20269901-000000.bak')).toBeNull();
    expect(fechaDeRespaldo('sigbo_cbvc-20261000-082934.bak')).toBeNull();
    expect(fechaDeRespaldo('sigbo_cbvc-20261009-002934.bak')).not.toBeNull();
    expect(fechaDeRespaldo('sigbo_cbvc-20261032-082934.bak')).toBeNull();
    expect(fechaDeRespaldo('sigbo_cbvc-20261009-242934.bak')).toBeNull();
    expect(fechaDeRespaldo('sigbo_cbvc-20261009-086034.bak')).toBeNull();
    expect(fechaDeRespaldo('sigbo_cbvc-20261009-082960.bak')).toBeNull();
  });

  it('alerta si no hay respaldo en 24 h, si la última corrida falló, si nunca se probó restaurar y si falta un .sha256', () => {
    const archivos = [
      { nombre: 'sigbo_cbvc-20261008-081341.bak', fecha: '2026-10-08T08:13:41', tamanioBytes: 1, tieneSha256: true },
      { nombre: 'sigbo_cbvc-20261006-080917.bak', fecha: '2026-10-06T08:09:17', tamanioBytes: 1, tieneSha256: false },
    ];
    const ahora = new Date('2026-10-09T12:00:00');
    const soloOk = parsearRegistro(REGISTRO).slice(0, 1);
    const mensajes = alertasRespaldo(archivos, soloOk, ahora).map((a) => `${a.nivel}:${a.mensaje}`);
    expect(mensajes.some((m) => m.startsWith('critica:') && m.includes('24 horas'))).toBe(true);
    expect(mensajes.some((m) => m.includes('Nunca se probó restaurar'))).toBe(true);
    expect(mensajes.some((m) => m.includes('.sha256'))).toBe(true);
    const conFallo = alertasRespaldo(archivos, parsearRegistro(REGISTRO).slice(0, 2), new Date('2026-10-08T09:00:00'));
    expect(conFallo.some((a) => a.nivel === 'critica' && a.mensaje.includes('FALLO'))).toBe(true);
    expect(conFallo.some((a) => a.mensaje.includes('24 horas'))).toBe(false);
    expect(alertasRespaldo([], [], ahora)[0]).toMatchObject({ nivel: 'critica' });
  });
});

describe('registros', () => {
  it('solo claves de la lista cerrada', () => {
    expect(esClaveRegistro('backend-err')).toBe(true);
    expect(esClaveRegistro('..\\backend\\.env')).toBe(false);
    expect(esClaveRegistro('constructor')).toBe(false);
  });

  it('oculta contraseñas, tokens, cookies y JWT antes de mostrar', () => {
    expect(ocultarSecretos('DB_PASSWORD=Sup3r!secreta otra=1')).toBe('DB_PASSWORD=[oculto] otra=1');
    expect(ocultarSecretos('{"password":"abc123","usuario":"x"}')).toBe('{"password":"[oculto]","usuario":"x"}');
    expect(ocultarSecretos('Authorization: Bearer abc.def.ghi')).not.toContain('abc.def.ghi');
    expect(ocultarSecretos('cookie sigbo_access=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3OCJ9.c2lnbmF0dXJhMTIz; path=/')).not.toMatch(/eyJ/);
    expect(ocultarSecretos('token: 0123456789abcdef')).toBe('token: [oculto]');
    expect(ocultarSecretos('[Nest] 123  - LOG [RouterExplorer] Mapped {/api/v1/salud, GET}')).toBe('[Nest] 123  - LOG [RouterExplorer] Mapped {/api/v1/salud, GET}');
  });

  it('se queda con las últimas líneas y saca los colores de consola', () => {
    expect(ultimasLineas('a\r\nb\r\nc\r\n', 2)).toEqual(['b', 'c']);
    expect(ultimasLineas('\u001b[32mLOG\u001b[39m listo', 5)).toEqual(['LOG listo']);
  });

  it('con max <= 0 no devuelve ninguna línea', () => {
    expect(ultimasLineas('a\nb\nc', 0)).toEqual([]);
    expect(ultimasLineas('a\nb\nc', -1)).toEqual([]);
    expect(ultimasLineas('a\nb\nc', Number.NaN)).toEqual([]);
  });

  it('oculta claves compuestas: JWT_SECRET, client_secret, DB_SECRET, *_token, csrf_token y JSON', () => {
    expect(ocultarSecretos('JWT_SECRET=abc123')).toBe('JWT_SECRET=[oculto]');
    expect(ocultarSecretos('client_secret=x')).toBe('client_secret=[oculto]');
    expect(ocultarSecretos('DB_SECRET=x')).toBe('DB_SECRET=[oculto]');
    expect(ocultarSecretos('access_token=x')).toBe('access_token=[oculto]');
    expect(ocultarSecretos('refresh_token=x')).toBe('refresh_token=[oculto]');
    expect(ocultarSecretos('csrf_token=x')).toBe('csrf_token=[oculto]');
    expect(ocultarSecretos('{"access_token":"zzz"}')).toBe('{"access_token":"[oculto]"}');
  });

  it('oculta el base64 de Authorization: Basic', () => {
    const r = ocultarSecretos('Authorization: Basic dXNlcjpwYXNz');
    expect(r).not.toContain('dXNlcjpwYXNz');
    expect(r).toBe('Authorization: [oculto]');
  });

  it('oculta todas las cookies de una cabecera Cookie:', () => {
    const r = ocultarSecretos('cookie: sid=abc; csrf=def');
    expect(r).not.toContain('abc');
    expect(r).not.toContain('def');
    expect(r).toBe('cookie: [oculto]');
  });

  it('oculta la contraseña de una URL de conexión', () => {
    expect(ocultarSecretos('mssql://sa:Pw123@host/db')).toBe('mssql://sa:[oculto]@host/db');
  });

  it('oculta un valor con espacios hasta el fin de la línea', () => {
    expect(ocultarSecretos('password: my long pass')).toBe('password: [oculto]');
  });

  it('quita los colores ANSI antes de buscar la clave, para que no partan clave y valor', () => {
    expect(ocultarSecretos('password\u001b[39m=abc')).toBe('password=[oculto]');
  });

  it('sigue ocultando Password=... en una cadena de conexión', () => {
    expect(ocultarSecretos('Server=x;Password=abc;Database=y')).toBe('Server=x;Password=[oculto];Database=y');
  });

  it('no tarda con una línea enorme de caracteres de palabra (sin backtracking cuadrático)', () => {
    const inicio = performance.now();
    const r = ocultarSecretos('a'.repeat(200_000));
    expect(performance.now() - inicio).toBeLessThan(200);
    expect(r.length).toBeLessThanOrEqual(4001);
  });

  it('el prefijo acotado sigue cubriendo claves compuestas largas', () => {
    const r = ocultarSecretos('x'.repeat(50) + '_SECRET=abc');
    expect(r).not.toContain('abc');
    expect(r).toContain('[oculto]');
  });

  it('el tope de 4000 caracteres corta antes de un password= al final de una línea enorme', () => {
    const r = ocultarSecretos('a'.repeat(5000) + ' password=zzz');
    expect(r).not.toContain('zzz');
  });

  it('password: x conserva el espacio tras los dos puntos', () => {
    expect(ocultarSecretos('password: x')).toBe('password: [oculto]');
  });

  it('reconoce el nivel de una línea de Nest', () => {
    expect(nivelDeLinea('[Nest] 1 - 09/10/2026 ERROR [ExceptionsHandler] x')).toBe('ERROR');
    expect(nivelDeLinea('[Nest] 1 - 09/10/2026 WARN [MatrizWeb] y')).toBe('WARN');
    expect(nivelDeLinea('[Nest] 1 - 09/10/2026 LOG [NestApplication] z')).toBe('LOG');
    expect(nivelDeLinea('=== 2026-10-09T08:00:00 ===')).toBe('OTRO');
  });
});

describe('migraciones', () => {
  const manifiesto = parsearManifiesto([
    '# comentario',
    `${'a'.repeat(64)}  000_create_database.sql`,
    `${'B'.repeat(64)}  093_centro_operaciones_incidentes.sql`,
    `${'c'.repeat(64)}  094_gre_base_documental.sql`,
    `${'d'.repeat(64)}  096_sistema_permisos.sql`,
  ].join('\n'));

  it('lee el manifiesto en mayúsculas y sin comentarios', () => {
    expect(manifiesto).toHaveLength(4);
    expect(manifiesto[2]).toEqual({ nombre: '094_gre_base_documental.sql', hash: 'C'.repeat(64) });
  });

  it('separa aplicadas, pendientes, alteradas y desconocidas (sin contar la 000)', () => {
    const e = compararMigraciones(manifiesto, [
      { nombre: '093_centro_operaciones_incidentes.sql', hash: 'b'.repeat(64), aplicadaEn: '2026-10-07T10:00:00Z' },
      { nombre: '096_sistema_permisos.sql', hash: 'e'.repeat(64), aplicadaEn: '2026-10-09T10:00:00Z' },
      { nombre: '050_vieja_borrada.sql', hash: 'f'.repeat(64), aplicadaEn: '2026-01-01T10:00:00Z' },
    ]);
    expect(e).toMatchObject({ total: 3, aplicadas: 2, pendientes: ['094_gre_base_documental.sql'], alteradas: ['096_sistema_permisos.sql'], desconocidas: ['050_vieja_borrada.sql'] });
    expect(e.ultimaAplicada).toEqual({ nombre: '096_sistema_permisos.sql', aplicadaEn: '2026-10-09T10:00:00.000Z' });
  });

  it('una fila sin hash no lanza y cuenta como alterada si el manifiesto tiene hash', () => {
    const e = compararMigraciones(manifiesto, [
      { nombre: '093_centro_operaciones_incidentes.sql', hash: null as unknown as string, aplicadaEn: '2026-10-07T10:00:00Z' },
    ]);
    expect(e.alteradas).toEqual(['093_centro_operaciones_incidentes.sql']);
  });
});

describe('red', () => {
  it('direcciones privadas reales primero (Wi-Fi/Ethernet), sin virtuales si hay reales', () => {
    const d = direccionesDeRed({
      'vEthernet (WSL)': [{ family: 'IPv4', address: '172.20.0.1', internal: false } as never],
      'Wi-Fi': [{ family: 'IPv4', address: '192.168.0.15', internal: false } as never, { family: 'IPv6', address: 'fe80::1', internal: false } as never],
      Loopback: [{ family: 'IPv4', address: '127.0.0.1', internal: true } as never],
      Otra: [{ family: 'IPv4', address: '10.0.0.9', internal: false } as never],
      Publica: [{ family: 'IPv4', address: '8.8.8.8', internal: false } as never],
    });
    expect(d.map((x) => x.ip)).toEqual(['192.168.0.15', '10.0.0.9']);
  });

  it('el QR de conexión usa el formato que lee la app', () => {
    expect(contenidoQrConexion('http://192.168.0.15:3001/api/v1')).toBe('sigbo://servidor?url=http%3A%2F%2F192.168.0.15%3A3001%2Fapi%2Fv1');
  });
});

describe('tareas de Windows', () => {
  it('el script solo nombra las tareas fijas', () => {
    expect(SCRIPT_CONSULTA_TAREAS).toContain("'SIGBO-Respaldo-Diario'");
    expect(SCRIPT_CONSULTA_TAREAS).toContain("'SIGBO-Arranque-Automatico'");
    expect(scriptIniciarTarea('SIGBO-Respaldo-Diario')).toBe("Start-ScheduledTask -TaskName 'SIGBO-Respaldo-Diario'");
  });

  it('lee la salida de PowerShell 5.1 (fechas /Date()/ y un solo objeto)', () => {
    const json = '[{"nombre":"SIGBO-Respaldo-Diario","existe":true,"estado":"Ready","ultimaEjecucion":"\\/Date(1791448174000)\\/","ultimoResultado":0,"proximaEjecucion":"\\/Date(1791525600000)\\/"},'
      + '{"nombre":"SIGBO-Arranque-Automatico","existe":false}]';
    const t = parsearTareas(json);
    expect(t[0]).toMatchObject({ existe: true, estado: 'LISTA', ultimoResultado: 0, descripcionResultado: 'Correcto' });
    expect(t[0].ultimaEjecucion).toBe(new Date(1791448174000).toISOString());
    expect(t[1]).toMatchObject({ existe: false, estado: null, ultimaEjecucion: null });
    const una = parsearTareas('{"nombre":"SIGBO-Respaldo-Diario","existe":true,"estado":"Running","ultimaEjecucion":"\\/Date(943920000000)\\/","ultimoResultado":267009}');
    expect(una[0]).toMatchObject({ estado: 'EN_EJECUCION', ultimaEjecucion: null, descripcionResultado: 'En ejecución' });
  });

  it('acepta solo nombres de tarea de la lista blanca', () => {
    expect(esTareaWindows('SIGBO-Respaldo-Diario')).toBe(true);
    expect(esTareaWindows('constructor')).toBe(false);
    expect(esTareaWindows("x'; calc; '")).toBe(false);
    expect(() => scriptIniciarTarea("x'; calc; '" as never)).toThrow('Tarea no permitida');
  });

  it('describe los códigos de resultado', () => {
    expect(describirResultado(267011)).toBe('Nunca se ejecutó');
    expect(describirResultado(1)).toBe('Código 1 (0x1)');
    expect(describirResultado(null)).toBeNull();
  });
});
