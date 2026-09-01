/**
 * Deuda de accesibilidad con linea base: falla si crece. No hay pruebas automatizadas
 * en el frontend, asi que esto y audit:contraste son la unica red.
 *
 * Correr: npm run audit:a11y
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(process.cwd(), 'src');
const files = [];

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
let encabezadosSinScope = 0;
let etiquetasSueltas = 0;
const culpables = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  confirmaciones += (source.match(/\bconfirm\s*\(/g) ?? []).length;
  entradasNativas += (source.match(/\bprompt\s*\(/g) ?? []).length;
  alertasNativas += (source.match(/\balert\s*\(/g) ?? []).length;
  botonesSinTipo += (source.match(/<button(?![^>]*\btype=)[^>]*>/g) ?? []).length;

  // Un <th> sin scope no le dice a un lector de pantalla que columna encabeza.
  // El lookahead por espacio o cierre evita contar <thead> como si fuera un <th>.
  const sinScope = (source.match(/<th(?=[\s>])(?![^>]*\bscope=)[^>]*>/g) ?? []).length;
  encabezadosSinScope += sinScope;

  // Una <label> cerrada antes de su control es decorativa: no nombra el campo ni
  // permite enfocarlo con un clic. Se asocia con htmlFor + id, o con aria-label si
  // el control se repite en una lista.
  let sueltas = 0;
  for (const m of source.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>\s*<(input|select|textarea|ComboBuscable)\b([^>]*)/g)) {
    const [, attrsLabel, interior, etiqueta, attrsControl] = m;
    if (/htmlFor=/.test(attrsLabel)) continue;
    // Una <label> que envuelve a su control ya lo nombra: no necesita htmlFor.
    if (/<(input|select|textarea|ComboBuscable)\b/.test(interior)) continue;
    if (etiqueta === 'ComboBuscable' ? /\bariaLabel=/.test(attrsControl) : /\baria-label=/.test(attrsControl)) continue;
    sueltas += 1;
  }
  etiquetasSueltas += sueltas;
  if (sinScope || sueltas) culpables.push(`  ${file.replace(process.cwd(), '.')} — ${sinScope} th sin scope, ${sueltas} etiquetas sueltas`);
}

const baseline = Object.freeze({
  confirmaciones: 0,
  entradasNativas: 0,
  alertasNativas: 0,
  botonesSinTipo: 0,
  encabezadosSinScope: 0,
  etiquetasSueltas: 0,
});

const resultado = {
  archivos: files.length,
  confirmaciones,
  entradasNativas,
  alertasNativas,
  botonesSinTipo,
  encabezadosSinScope,
  etiquetasSueltas,
  baseline,
};

const excedidos = Object.keys(baseline).filter((k) => resultado[k] > baseline[k]);
if (excedidos.length > 0) {
  console.error('La deuda de accesibilidad aumentó respecto de la línea base:', excedidos.join(', '));
  console.error(resultado);
  if (culpables.length) console.error(culpables.slice(0, 20).join('\n'));
  process.exit(1);
}

console.log('Auditoría de accesibilidad superada.', resultado);
