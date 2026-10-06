#!/usr/bin/env node
/**
 * Firma digital de las versiones de la app movil (Ed25519, open source).
 *
 * Por que existe: el SHA-256 del APK viaja desde el mismo servidor que el APK,
 * asi que por si solo no prueba QUIEN lo publico. La app lleva embebida la
 * clave PUBLICA (lib/clave_publica.dart) y solo acepta una actualizacion cuyos
 * datos (version, hash, tamano, obligatoria, notas) esten firmados con la
 * clave PRIVADA, que vive fuera del repositorio y del servidor.
 *
 * Uso:
 *   node firmar-version.mjs generar-clave [--clave <pem>]
 *   node firmar-version.mjs publicar --apk <apk> --codigo <n> --nombre <x.y.z>
 *        --destino <dir> [--obligatoria] [--notas "..."] [--clave <pem>]
 *   node firmar-version.mjs verificar --destino <dir>
 *
 * El mensaje firmado (idem en lib/actualizador.dart) es:
 *   sigbo-apk-v1 \n codigo \n nombre \n obligatoria \n sha256(notas) \n tamano \n sha256(apk)
 */
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const dartClavePublica = resolve(aqui, '..', 'lib', 'clave_publica.dart');

function args(lista) {
  const r = { _: [] };
  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    if (!a.startsWith('--')) { r._.push(a); continue; }
    const k = a.slice(2);
    const siguiente = lista[i + 1];
    if (siguiente === undefined || siguiente.startsWith('--')) r[k] = true;
    else { r[k] = siguiente; i++; }
  }
  return r;
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function sha256Archivo(ruta) {
  return sha256(readFileSync(ruta));
}

export function mensajeFirmado({ versionCodigo, versionNombre, obligatoria, notas, tamanioBytes, sha256: hash }) {
  return [
    'sigbo-apk-v1',
    String(versionCodigo),
    String(versionNombre),
    obligatoria ? 'true' : 'false',
    sha256(Buffer.from(notas ?? '', 'utf8')),
    String(tamanioBytes),
    hash,
  ].join('\n');
}

function rutaClave(o) {
  return resolve(o.clave || join(homedir(), '.sigbo', 'clave-actualizaciones.pem'));
}

function generarClave(o) {
  const ruta = rutaClave(o);
  if (existsSync(ruta)) {
    console.log(`Ya existe una clave en ${ruta}; no se reemplaza (reemplazarla dejaria sin actualizar a los celulares ya instalados).`);
  } else {
    mkdirSync(dirname(ruta), { recursive: true });
    const { privateKey } = generateKeyPairSync('ed25519');
    writeFileSync(ruta, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
    console.log(`Clave PRIVADA creada en ${ruta}. GUARDE UNA COPIA FUERA DE ESTA PC: si se pierde, las apps ya instaladas no aceptaran nuevas actualizaciones.`);
  }
  const privada = createPrivateKey(readFileSync(ruta));
  const raw = createPublicKey(privada).export({ type: 'spki', format: 'der' }).subarray(-32);
  const dart = `// GENERADO por scripts/firmar-version.mjs. Clave PUBLICA Ed25519 con la que la app
// verifica que una actualizacion fue publicada por el cuartel. No es secreta.
// Si la clave privada cambia, hay que reinstalar la app a mano una vez.
const String kClavePublicaActualizaciones = '${raw.toString('base64')}';
`;
  writeFileSync(dartClavePublica, dart);
  console.log(`Clave publica escrita en ${dartClavePublica}. Recompile la app para que la lleve embebida.`);
}

function publicar(o) {
  for (const k of ['apk', 'codigo', 'nombre', 'destino']) if (!o[k]) throw new Error(`Falta --${k}`);
  const ruta = rutaClave(o);
  if (!existsSync(ruta)) throw new Error(`No hay clave privada en ${ruta}. Ejecute: node firmar-version.mjs generar-clave`);
  const privada = createPrivateKey(readFileSync(ruta));

  const apk = readFileSync(o.apk);
  const datos = {
    versionCodigo: Number(o.codigo),
    versionNombre: String(o.nombre),
    obligatoria: o.obligatoria === true || o.obligatoria === 'true',
    notas: typeof o.notas === 'string' ? o.notas : '',
    tamanioBytes: apk.length,
    sha256: sha256(apk),
  };
  if (!Number.isInteger(datos.versionCodigo) || datos.versionCodigo < 1) throw new Error('--codigo invalido');
  if (!/^\d+\.\d+\.\d+$/.test(datos.versionNombre)) throw new Error('--nombre debe ser X.Y.Z');

  const firma = sign(null, Buffer.from(mensajeFirmado(datos), 'utf8'), privada).toString('base64');
  const destino = resolve(o.destino);
  mkdirSync(destino, { recursive: true });
  copyFileSync(o.apk, join(destino, 'sigbo-alertas.apk'));
  writeFileSync(
    join(destino, 'version.json'),
    JSON.stringify({ ...datos, firma, publicadoEn: new Date().toISOString() }, null, 2),
  );
  console.log(`Firmada la version ${datos.versionNombre} (codigo ${datos.versionCodigo}), sha256 ${datos.sha256.slice(0, 16)}...`);
}

/** Comprueba lo publicado contra la clave publica: lo mismo que hace la app. */
function verificar(o) {
  const destino = resolve(o.destino);
  const meta = JSON.parse(readFileSync(join(destino, 'version.json'), 'utf8'));
  const apk = readFileSync(join(destino, 'sigbo-alertas.apk'));
  const clavePub = createPublicKey(createPrivateKey(readFileSync(rutaClave(o))));
  const datos = { ...meta, tamanioBytes: apk.length, sha256: sha256(apk) };
  const ok = verify(null, Buffer.from(mensajeFirmado(datos), 'utf8'), clavePub, Buffer.from(meta.firma, 'base64'));
  console.log(ok ? 'OK: la version publicada esta correctamente firmada.' : 'ERROR: la firma NO coincide con el APK publicado.');
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const o = args(process.argv.slice(2));
  try {
    const cmd = o._[0];
    if (cmd === 'generar-clave') generarClave(o);
    else if (cmd === 'publicar') publicar(o);
    else if (cmd === 'verificar') verificar(o);
    else {
      console.log('Uso: generar-clave | publicar --apk ... | verificar --destino ...');
      process.exit(2);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}
