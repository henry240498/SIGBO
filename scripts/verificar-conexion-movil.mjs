#!/usr/bin/env node
/**
 * Hace, desde esta PC y por la direccion de la RED (no por localhost), lo mismo que hace la
 * app del celular: comprobar el servidor, iniciar sesion como app, leer datos, renovar la
 * sesion y descargar el APK. Si esto da todo OK y el celular no conecta, el problema esta en
 * el WiFi o el firewall (ver la pagina de conectar-celulares.bat), no en SIGBO.
 *
 * Uso:  node scripts/verificar-conexion-movil.mjs [--ip 192.168.1.10]
 * La contrasena se toma de SIGBO_DEMO_PASSWORD en backend/.env (solo para pruebas locales).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { direccionesDeLaPc } from './conectar-celulares.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = (() => { try { return readFileSync(join(raiz, 'backend', '.env'), 'utf8'); } catch { return ''; } })();
const puerto = Number(env.match(/^\s*PORT\s*=\s*(\d+)/m)?.[1] ?? 3001);
const clave = env.match(/^\s*SIGBO_DEMO_PASSWORD\s*=\s*(.+?)\s*$/m)?.[1];
const i = process.argv.indexOf('--ip');
const ip = i >= 0 ? process.argv[i + 1] : direccionesDeLaPc()[0]?.ip;

if (!ip) { console.error('Esta PC no tiene una red local activa.'); process.exit(2); }
if (!clave) { console.error('No se encontro SIGBO_DEMO_PASSWORD en backend/.env: no se puede probar el inicio de sesion.'); process.exit(2); }

const base = `http://${ip}:${puerto}/api/v1`;
const movil = { 'Content-Type': 'application/json', 'X-SIGBO-Dispositivo': 'movil' };
let fallos = 0;
const ok = (c, t) => { if (!c) fallos++; console.log(c ? 'OK   ' : 'FALLA', t); };

console.log(`Probando ${base}\n`);
try {
  let r = await fetch(`${base}/salud`, { signal: AbortSignal.timeout(6000) });
  ok(r.status === 200, `el servidor responde (${r.status})`);
  r = await fetch(`${base}/auth/login`, { method: 'POST', headers: movil, body: JSON.stringify({ usernameOrEmail: 'admin', password: clave }) });
  const j = await r.json().catch(() => ({}));
  ok(r.status === 201 && !!j.accessToken && !!j.refreshToken, `inicio de sesion como app, sin cookies (${r.status})`);
  const auth = { Authorization: `Bearer ${j.accessToken}`, 'X-SIGBO-Dispositivo': 'movil' };
  for (const p of ['/flota/tablero', '/convocatorias/abiertas', '/flota/disponibilidad', '/cartografia/hidrantes', '/ausencias']) {
    r = await fetch(base + p, { headers: auth });
    ok(r.status === 200, `lectura ${p} (${r.status})`);
  }
  r = await fetch(`${base}/auth/refresh`, { method: 'POST', headers: movil, body: JSON.stringify({ refreshToken: j.refreshToken }) });
  ok([200, 201].includes(r.status), `renovacion de la sesion (${r.status})`);
  const v = await (await fetch(`${base}/app-movil/version`)).json();
  if (v.disponible) {
    const b = Buffer.from(await (await fetch(`${base}/app-movil/descargar`)).arrayBuffer());
    ok(createHash('sha256').update(b).digest('hex') === v.sha256 && b.length === v.tamanioBytes, `descarga del APK ${v.versionNombre} (${(b.length / 1048576).toFixed(1)} MB) y su hash coincide con el publicado`);
  } else {
    console.log('AVISO ya hay un APK publicado? No: use .movile\\scripts\\publicar-apk.ps1');
  }
} catch (e) {
  fallos++;
  console.log('FALLA no se pudo conectar:', e.cause?.code ?? e.message);
}
console.log(fallos === 0 ? '\nTODO OK: el servidor esta listo para los celulares.' : `\n${fallos} problema(s). Revise que SIGBO este iniciado (iniciar-sigbo.bat).`);
process.exit(fallos ? 1 : 0);
