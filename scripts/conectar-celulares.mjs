#!/usr/bin/env node
/**
 * Prepara la conexion de los celulares con el servidor SIGBO de esta PC.
 *
 * Que hace:
 *  1. Comprueba que el servidor responde en esta PC.
 *  2. Detecta las direcciones de la PC en la red (descarta las virtuales: Docker, WSL, VMware...).
 *  3. Prueba cada una (GET /api/v1/salud) y genera una pagina con dos QR por direccion:
 *       - "Conectar la app": lo escanea la app en Conectar con el servidor.
 *       - "Instalar la app": lo escanea la camara del celular para descargar el APK desde esta PC.
 *  4. Abre esa pagina en el navegador (logs\conectar-celulares.html).
 *
 * Uso:  node scripts/conectar-celulares.mjs [--sin-abrir]   (o doble clic en conectar-celulares.bat)
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { networkInterfaces } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sinAbrir = process.argv.includes('--sin-abrir');

/** El mismo formato que lee la app (lib/conexion.dart: contenidoQrServidor). */
export const contenidoQr = (url) => `sigbo://servidor?url=${encodeURIComponent(url)}`;

const VIRTUALES = /vethernet|wsl|vmware|virtualbox|hyper-v|docker|loopback|tailscale|zerotier|vpn|bluetooth/i;
const esPrivada = (ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);

/** Direcciones IPv4 privadas de interfaces reales, las mas probables primero (Wi-Fi/Ethernet). */
export function direccionesDeLaPc(interfaces = networkInterfaces()) {
  const todas = [];
  for (const [nombre, lista] of Object.entries(interfaces)) {
    for (const i of lista ?? []) {
      if (i.family === 'IPv4' && !i.internal && esPrivada(i.address)) todas.push({ nombre, ip: i.address, virtual: VIRTUALES.test(nombre) });
    }
  }
  const reales = todas.filter((d) => !d.virtual);
  return (reales.length ? reales : todas).sort((a, b) => Number(/wi-?fi|wlan|ethernet|eth|en\d/i.test(b.nombre)) - Number(/wi-?fi|wlan|ethernet|eth|en\d/i.test(a.nombre)));
}

function puertoDelBackend() {
  try {
    const m = readFileSync(join(raiz, 'backend', '.env'), 'utf8').match(/^\s*PORT\s*=\s*(\d+)/m);
    if (m) return Number(m[1]);
  } catch { /* sin .env: puerto por defecto */ }
  return 3001;
}

async function responde(url) {
  try {
    const r = await fetch(`${url}/salud`, { signal: AbortSignal.timeout(4000) });
    const j = await r.json().catch(() => ({}));
    return r.status === 200 && j.estado === 'disponible';
  } catch {
    return false;
  }
}

const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function main() {
  const puerto = puertoDelBackend();
  const local = `http://localhost:${puerto}/api/v1`;
  const servidorActivo = await responde(local);

  let QRCode;
  try {
    QRCode = createRequire(join(raiz, 'frontend', 'package.json'))('qrcode');
  } catch {
    console.error('Falta la libreria qrcode: ejecute "npm install" dentro de la carpeta frontend.');
    process.exit(1);
  }
  const qr = (texto) => QRCode.toDataURL(texto, { width: 300, margin: 2, errorCorrectionLevel: 'M' });

  const direcciones = direccionesDeLaPc();
  const filas = [];
  for (const d of direcciones) {
    const api = `http://${d.ip}:${puerto}/api/v1`;
    filas.push({ ...d, api, descarga: `${api}/app-movil/descargar`, ok: servidorActivo ? await responde(api) : false, qrConexion: await qr(contenidoQr(api)), qrDescarga: await qr(`${api}/app-movil/descargar`) });
  }

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Conectar celulares - SIGBO</title>
<style>
 body{font-family:system-ui,sans-serif;margin:0;padding:24px;background:#f6f8fa;color:#10263f;line-height:1.45}
 h1{font-size:22px;margin:0 0 4px} h2{font-size:16px;margin:0 0 8px}
 .tarjeta{background:#fff;border:1px solid #d6e1ea;border-radius:10px;padding:16px;margin:16px 0;max-width:760px}
 .qrs{display:flex;gap:24px;flex-wrap:wrap}.qrs figure{margin:0;text-align:center;max-width:300px}
 .ok{color:#0f6350;font-weight:600}.mal{color:#9d2b27;font-weight:600}
 code{background:#eef2f6;padding:2px 6px;border-radius:4px;word-break:break-all}
 ol,ul{margin:6px 0 6px 20px;padding:0}
</style></head><body>
<h1>Conectar los celulares con SIGBO</h1>
<p>Los celulares tienen que estar conectados al <strong>mismo WiFi</strong> que esta PC.</p>
${servidorActivo ? '' : `<div class="tarjeta"><p class="mal">El servidor NO responde en esta PC (puerto ${puerto}).</p><p>Abra primero <code>iniciar-sigbo.bat</code>, espere el mensaje «SIGBO-CBVC listo» y vuelva a abrir <code>conectar-celulares.bat</code>.</p></div>`}
${filas.length === 0 ? '<div class="tarjeta"><p class="mal">Esta PC no tiene una conexion de red local (WiFi o cable) activa.</p></div>' : ''}
${filas.map((f) => `<div class="tarjeta"><h2>${escapar(f.nombre)} · <code>${escapar(f.ip)}</code></h2>
<p>${f.ok ? '<span class="ok">El servidor responde en esta direccion.</span>' : '<span class="mal">El servidor no respondio en esta direccion.</span>'}</p>
<div class="qrs">
<figure><img src="${f.qrConexion}" width="300" height="300" alt="QR para conectar la app a ${escapar(f.api)}"><figcaption><strong>1. Conectar la app</strong><br>En la app: <em>Conectar con el servidor → Escanear QR</em></figcaption></figure>
<figure><img src="${f.qrDescarga}" width="300" height="300" alt="QR para descargar la app desde ${escapar(f.descarga)}"><figcaption><strong>Instalar la app</strong> (si aun no la tiene)<br>Escanear con la camara del celular y descargar el APK</figcaption></figure>
</div>
<p>Direccion para escribir a mano: <code>${escapar(f.ip)}:${puerto}</code></p></div>`).join('\n')}
<div class="tarjeta"><h2>Si el celular no logra conectarse</h2><ul>
<li>Comprobar que el celular y la PC estan en el mismo WiFi (no en «datos moviles» ni en una red de invitados).</li>
<li>Algunos routers aislan los dispositivos entre si («aislamiento de clientes» o «AP isolation»): hay que desactivarlo en el router.</li>
<li>Firewall de Windows: si pregunto por «Node.js», debe estar permitido. Si no, abrir PowerShell <strong>como administrador</strong> y ejecutar:<br><code>New-NetFirewallRule -DisplayName "SIGBO API ${puerto}" -Direction Inbound -LocalPort ${puerto} -Protocol TCP -Action Allow -Profile Any</code></li>
<li>La direccion de la PC puede cambiar si se reinicia el router. Conviene reservar una IP fija para esta PC en el router (o en Windows) y asi no repetir este paso.</li>
<li>Fuera del cuartel (sin ese WiFi) se usa el tunel: <code>tunel-sigbo.bat</code>.</li></ul></div>
<p style="font-size:12px;color:#64748b">Generado ${escapar(new Date().toLocaleString('es-PY'))}. El QR no contiene claves: solo la direccion del servidor.</p>
</body></html>`;

  mkdirSync(join(raiz, 'logs'), { recursive: true });
  const archivo = join(raiz, 'logs', 'conectar-celulares.html');
  writeFileSync(archivo, html, 'utf8');

  console.log(`Servidor en esta PC (${local}): ${servidorActivo ? 'RESPONDE' : 'NO RESPONDE -> abra iniciar-sigbo.bat'}`);
  for (const f of filas) console.log(`  ${f.nombre.padEnd(18)} ${f.api}  ${f.ok ? 'OK' : 'sin respuesta'}`);
  if (filas.length === 0) console.log('  (no hay una red local activa)');
  console.log(`Pagina con los QR: ${archivo}`);
  if (!sinAbrir) spawn('cmd', ['/c', 'start', '', archivo], { detached: true, stdio: 'ignore' }).unref();
  process.exit(servidorActivo && filas.some((f) => f.ok) ? 0 : 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
