import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(process.cwd(), 'src');
const files = [];
const baseline = Object.freeze({ confirmaciones: 0, entradasNativas: 0, alertasNativas: 0, botonesSinTipo: 0 });

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(path);
  }
}

await walk(root);

let confirmaciones = 0;
let entradasNativas = 0;
let alertasNativas = 0;
let botonesSinTipo = 0;
for (const file of files) {
  const source = await readFile(file, 'utf8');
  confirmaciones += (source.match(/\bconfirm\s*\(/g) ?? []).length;
  entradasNativas += (source.match(/\bprompt\s*\(/g) ?? []).length;
  alertasNativas += (source.match(/\balert\s*\(/g) ?? []).length;
  botonesSinTipo += (source.match(/<button(?![^>]*\btype=)[^>]*>/g) ?? []).length;
}

const resultado = { archivos: files.length, confirmaciones, entradasNativas, alertasNativas, botonesSinTipo, baseline };
if (confirmaciones > baseline.confirmaciones || entradasNativas > baseline.entradasNativas || alertasNativas > baseline.alertasNativas || botonesSinTipo > baseline.botonesSinTipo) {
  console.error('La deuda de accesibilidad aumentó respecto de la línea base.', resultado);
  process.exit(1);
}

console.log('Auditoría de accesibilidad superada.', resultado);
