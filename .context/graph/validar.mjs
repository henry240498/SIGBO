#!/usr/bin/env node
/**
 * Validador de integridad del grafo de SIGBO.
 *
 *   node .context/graph/validar.mjs
 *
 * Comprueba:
 *   1. Todo wikilink resuelve a un nodo existente.
 *   2. Toda arista apunta a nodos que existen y usa un tipo declarado.
 *   3. Los nodos cumplen el contrato de SCHEMA.md (tipo, nivel, nombre).
 *   4. Los indices estan sincronizados con los nodos en disco.
 *   5. Reporta hallazgos estructurales del repositorio.
 *
 * Sale con codigo 1 si hay errores (util en un hook o en CI).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRAPH_DIR = dirname(fileURLToPath(import.meta.url));
const CONTEXT_DIR = dirname(GRAPH_DIR);

const errores = [];
const avisos = [];

const idxPath = join(GRAPH_DIR, 'indexes', 'nodes.json');
if (!existsSync(idxPath)) {
  console.error('No hay indices. Corre primero: node .context/graph/build-graph.mjs');
  process.exit(1);
}
const nodes = JSON.parse(readFileSync(idxPath, 'utf8'));
const ids = new Set(nodes.map((n) => n.id));

const edgesPath = join(GRAPH_DIR, 'edges', 'edges.jsonl');
const edges = existsSync(edgesPath)
  ? readFileSync(edgesPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : [];

function walkMd(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    if (e === '.obsidian') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkMd(p, out);
    else if (e.endsWith('.md')) out.push(p);
  }
  return out;
}
const mdFiles = walkMd(CONTEXT_DIR);
const rel = (p) => relative(CONTEXT_DIR, p).split('\\').join('/');

// -------------------------------------------------- 1. wikilinks resuelven

const rotos = new Map();
for (const f of mdFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g)) {
    const target = m[1].trim();
    if (ids.has(target)) continue;
    if (!rotos.has(target)) rotos.set(target, new Set());
    rotos.get(target).add(rel(f));
  }
}
for (const [t, fs] of rotos) {
  errores.push(`wikilink sin destino: [[${t}]]  <-  ${[...fs].slice(0, 3).join(', ')}`);
}

// ------------------------------------------------------ 2. aristas validas

const TIPOS_ARISTA = new Set(['persisted_in', 'belongs_to', 'exposes', 'uses', 'calls',
  'reads', 'writes', 'references', 'relates_to', 'defined_in', 'contains', 'affects',
  'constrains', 'originates_from', 'depends_on', 'configured_by', 'documented_in',
  'supersedes']);

for (const e of edges) {
  if (!ids.has(e.from)) errores.push(`arista con origen inexistente: ${e.from} --${e.tipo}--> ${e.to}`);
  if (!ids.has(e.to)) errores.push(`arista con destino inexistente: ${e.from} --${e.tipo}--> ${e.to}`);
  if (!TIPOS_ARISTA.has(e.tipo)) errores.push(`tipo de arista no declarado en SCHEMA.md: ${e.tipo}`);
}

// ------------------------------------------- 3. contrato de nodos

const TIPOS_NODO = new Set(['DOMAIN', 'ENTITY', 'TABLE', 'SERVICE', 'API', 'SCREEN',
  'COMPONENT', 'CONFIGURATION', 'FILE', 'WORKFLOW', 'RULE', 'DECISION', 'DEPENDENCY',
  'ERROR', 'PROCEDURE']);
const NIVELES = new Set(['L0', 'L1', 'L2', 'L3']);

for (const n of nodes) {
  if (!TIPOS_NODO.has(n.tipo)) errores.push(`tipo de nodo no declarado: ${n.tipo} (${n.id})`);
  if (!NIVELES.has(n.nivel)) errores.push(`nivel invalido "${n.nivel}" en ${n.id}`);
  if (!n.nombre) errores.push(`nodo sin nombre: ${n.id}`);
  if (n.curado && !n.resumen) avisos.push(`nodo curado sin resumen: ${n.id}`);
  if (n.curado && !n.terminos?.length) avisos.push(`nodo curado sin terminos de busqueda: ${n.id}`);
}

const curados = walkMd(join(GRAPH_DIR, 'curated'));
for (const f of curados) {
  const txt = readFileSync(f, 'utf8');
  const id = (/^id:\s*(\S+)/m.exec(txt) ?? [])[1];
  if (!id) { errores.push(`curado sin id: ${rel(f)}`); continue; }
  if (!ids.has(id)) errores.push(`curado ausente del indice (¿falta regenerar?): ${id}`);
  const tipo = (/^tipo:\s*(\S+)/m.exec(txt) ?? [])[1];
  if ((tipo === 'RULE' || tipo === 'ERROR') && !/^severidad:/m.test(txt)) {
    avisos.push(`${tipo} sin severidad: ${id}`);
  }
  if (basename(f) !== `${id}.md`) avisos.push(`nombre de archivo != id: ${rel(f)} (esperado ${id}.md)`);
}

// -------------------------------------- 4. indices sincronizados con disco

const enDisco = walkMd(join(GRAPH_DIR, 'nodes')).length;
if (enDisco !== nodes.length) {
  errores.push(`desincronizacion: ${enDisco} nodos en disco vs ${nodes.length} en nodes.json. Regenera el grafo.`);
}

// ------------------------- 4.5 numeracion de migraciones (rule--migracion-nunca-se-edita)

const MIGRACIONES = join(dirname(CONTEXT_DIR), 'database', 'migrations');
if (existsSync(MIGRACIONES)) {
  const sql = readdirSync(MIGRACIONES).filter((f) => f.endsWith('.sql')).sort();
  const porPrefijo = new Map();
  for (const f of sql) {
    const m = /^(\d+)_/.exec(f);
    if (!m) { avisos.push(`migracion sin prefijo numerico: ${f}`); continue; }
    if (!porPrefijo.has(m[1])) porPrefijo.set(m[1], []);
    porPrefijo.get(m[1]).push(f);
  }
  for (const [prefijo, archivos] of porPrefijo) {
    if (archivos.length > 1) {
      // No es un error del grafo, es un riesgo real del esquema: con dos archivos
      // del mismo numero el orden depende del filesystem, no de la numeracion.
      avisos.push(`prefijo de migracion duplicado ${prefijo}: ${archivos.join(' + ')} — el orden de ejecucion no esta garantizado`);
    }
  }
  const numeros = [...porPrefijo.keys()].map(Number).sort((a, b) => a - b);
  const ultimo = numeros[numeros.length - 1];
  console.log(`Migraciones: ${sql.length} archivos, ultimo prefijo ${String(ultimo).padStart(3, '0')}. `
    + `El siguiente libre es ${String(ultimo + 1).padStart(3, '0')}.\n`);
}

// ------------------------------------------- 5. hallazgos estructurales

const stats = JSON.parse(readFileSync(join(GRAPH_DIR, 'indexes', 'stats.json'), 'utf8'));
const huecos = stats.huecos ?? {};

const conArista = new Set(edges.flatMap((e) => [e.from, e.to]));
const planificados = [];
const solos = [];
for (const n of nodes) {
  if (conArista.has(n.id)) continue;
  if (['DEPENDENCY', 'FILE'].includes(n.tipo)) continue;
  if (n.tipo === 'DOMAIN' && (n.estado === 'PLANIFICADO' || n.estado === 'SOLO_BD')) {
    planificados.push(n.nombre);
    continue;
  }
  solos.push(n);
}
for (const n of solos) avisos.push(`nodo sin ninguna relacion: ${n.id} (${n.tipo})`);

// ------------------------------------------------------------------ salida

console.log(`\nValidacion del grafo de SIGBO`);
console.log(`  ${nodes.length} nodos · ${edges.length} aristas · ${mdFiles.length} archivos .md revisados\n`);

if (errores.length) {
  console.log(`ERRORES (${errores.length}):`);
  errores.slice(0, 30).forEach((e) => console.log(`  x ${e}`));
  if (errores.length > 30) console.log(`  ... y ${errores.length - 30} mas`);
  console.log('');
}
if (avisos.length) {
  console.log(`AVISOS (${avisos.length}):`);
  avisos.slice(0, 25).forEach((a) => console.log(`  ! ${a}`));
  if (avisos.length > 25) console.log(`  ... y ${avisos.length - 25} mas`);
  console.log('');
}
if (!errores.length && !avisos.length) console.log('OK: sin errores ni avisos.\n');

if (planificados.length) {
  console.log(`Dominios declarados y aun no construidos (esperado): ${planificados.join(', ')}\n`);
}

console.log('Hallazgos estructurales del repositorio (no son errores del grafo):');
for (const [k, v] of Object.entries(huecos)) {
  if (Array.isArray(v) && v.length) {
    console.log(`  ${k}: ${v.length}  -> ${v.slice(0, 4).join(', ')}${v.length > 4 ? ', ...' : ''}`);
  }
}
if (stats.advertencias?.length) {
  console.log('\nAdvertencias del generador:');
  stats.advertencias.forEach((w) => console.log(`  - ${w}`));
}
console.log('');

process.exit(errores.length ? 1 : 0);
