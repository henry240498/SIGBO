/**
 * Smoke test del expediente del bombero contra un backend levantado.
 *
 * Golpea, una por una, las rutas que consume cada seccion del expediente y reporta el
 * codigo que devuelve. Cubre lo que no se puede ver sin backend: que la ruta exista de
 * verdad, que el permiso deje pasar, que la respuesta sea JSON y que una ficha sin datos
 * conteste vacio en vez de fallar.
 *
 * No reemplaza la revision en navegador: no ve consola, ni render, ni responsive.
 *
 * Uso:
 *   node scripts/smoke-expediente.mjs --usuario <u> --password <p> [--bombero <id>]
 *   node scripts/smoke-expediente.mjs --token <jwt> --bombero <id>
 *
 * Sin --bombero toma el primero que devuelva el listado.
 */

const arg = (nombre, porDefecto = null) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : porDefecto;
};

const BASE = arg('base', 'http://localhost:3001/api/v1');
const usuario = arg('usuario');
const password = arg('password');
let token = arg('token');
let bomberoId = arg('bombero');

/** Cada seccion con las rutas que consulta al abrirse. `:id` se reemplaza por el bombero. */
const SECCIONES = [
  ['Resumen', []],
  ['Datos personales', ['/personal/bomberos/:id']],
  ['Institucional', ['/organizacion/companias', '/organizacion/cuarteles', '/organizacion/turnos', '/organizacion/brigadas', '/organizacion/departamentos', '/organizacion/unidades']],
  ['Tipo de bombero', ['/personal/tipos-bombero']],
  ['Rango y cargo', []],
  ['Trayectoria', ['/personal/bomberos/:id/historial']],
  ['Especialidades', ['/personal/bomberos/:id/especialidades']],
  ['Condicion', ['/personal/bomberos/:id/condicion']],
  ['Formacion', ['/personal/bomberos/:id/formacion-academia']],
  ['Actividad profesional', ['/personal/bomberos/:id/actividad-profesional']],
  ['Idiomas', ['/personal/bomberos/:id/idiomas']],
  ['Servicios / Guardias', ['/personal/bomberos/:id/servicios']],
  ['Equipamiento', ['/personal/bomberos/:id/equipamiento', '/equipos/equipos?estado=OPERATIVO']],
  ['Vehiculos autorizados', ['/personal/bomberos/:id/vehiculos-autorizados', '/vehiculos/vehiculos?estado=OPERATIVO']],
  ['Salud', ['/personal/bomberos/:id/seguros']],
  ['Firma digital', ['/personal/bomberos/:id/firma-digital']],
  ['Documentos', []],
  ['Foja de servicio', ['/personal/bomberos/:id/foja-servicio']],
  ['Linea de tiempo', ['/personal/bomberos/:id/historial']],
  ['Auditoria', ['/seguridad/auditoria?recurso=personal.bomberos&recursoId=:id&pageSize=100']],
];

const cabeceras = () => (token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' });

async function pedir(ruta) {
  const url = BASE + ruta.replaceAll(':id', bomberoId ?? '');
  const t0 = Date.now();
  try {
    const res = await fetch(url, { headers: cabeceras() });
    const ms = Date.now() - t0;
    const tipo = res.headers.get('content-type') ?? '';
    let forma = '';
    if (tipo.includes('json')) {
      const cuerpo = await res.json().catch(() => null);
      if (Array.isArray(cuerpo)) forma = `array(${cuerpo.length})`;
      else if (cuerpo && typeof cuerpo === 'object') forma = Array.isArray(cuerpo.items) ? `items(${cuerpo.items.length})` : 'objeto';
      else forma = 'vacio';
    } else forma = tipo.split(';')[0] || 'sin tipo';
    return { ok: res.ok, estado: res.status, forma, ms };
  } catch (e) {
    return { ok: false, estado: 0, forma: e.code ?? 'sin conexion', ms: Date.now() - t0 };
  }
}

/* ---------- 1. El backend responde ---------- */

const salud = await pedir('/salud');
if (salud.estado === 0) {
  console.error(`El backend no responde en ${BASE}.`);
  console.error('Levantalo con: cd backend; npm run start:dev');
  process.exit(2);
}
console.log(`Backend en ${BASE} — /salud ${salud.estado} (${salud.ms} ms)\n`);

/* ---------- 2. Sesion ---------- */

if (!token && usuario && password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: usuario, password }),
  });
  if (!res.ok) {
    console.error(`Login fallido (${res.status}). Revisá usuario y contraseña.`);
    process.exit(2);
  }
  const cuerpo = await res.json().catch(() => ({}));
  token = cuerpo.accessToken ?? cuerpo.access_token ?? null;
  console.log(token ? 'Sesión iniciada.\n' : 'Login OK pero sin token en el cuerpo: el backend usa cookie HttpOnly.\n');
}

/* ---------- 3. Una ficha sobre la que probar ---------- */

if (!bomberoId) {
  const res = await fetch(`${BASE}/personal/bomberos`, { headers: cabeceras() });
  const lista = res.ok ? await res.json().catch(() => []) : [];
  bomberoId = Array.isArray(lista) && lista[0]?.id ? lista[0].id : null;
  if (!bomberoId) {
    console.error('No se pudo obtener un bombero del listado. Pasá uno con --bombero <id>.');
    process.exit(2);
  }
  console.log(`Ficha de prueba: ${bomberoId}\n`);
}

/* ---------- 4. Recorrido ---------- */

console.log('seccion                     ruta                                                  estado  forma');
console.log('-'.repeat(104));

let fallos = 0;
let vacias = 0;
for (const [seccion, rutas] of SECCIONES) {
  if (rutas.length === 0) {
    console.log(`${seccion.padEnd(27)} ${'(no consulta al backend)'.padEnd(53)} ${'—'.padEnd(7)} —`);
    continue;
  }
  for (const [i, ruta] of rutas.entries()) {
    const r = await pedir(ruta);
    if (!r.ok) fallos += 1;
    if (/\(0\)/.test(r.forma)) vacias += 1;
    const etiqueta = i === 0 ? seccion : '';
    const marca = r.ok ? ' ' : '!';
    console.log(`${etiqueta.padEnd(27)} ${ruta.slice(0, 53).padEnd(53)} ${marca}${String(r.estado).padEnd(6)} ${r.forma} (${r.ms} ms)`);
  }
}

console.log('-'.repeat(104));
console.log(`Rutas con error: ${fallos}   ·   respuestas vacías: ${vacias}`);
console.log('\nUna respuesta vacía no es un fallo: puede ser una ficha sin datos en esa sección.');
console.log('Lo que sí hay que mirar es cualquier estado marcado con "!".');
process.exit(fallos > 0 ? 1 : 0);
