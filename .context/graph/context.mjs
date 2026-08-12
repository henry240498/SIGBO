#!/usr/bin/env node
/**
 * Recuperador de contexto minimo de SIGBO.
 *
 * Busca en los indices del grafo y emite SOLO el contexto necesario para una
 * tarea, escalando por niveles. No lee el codigo: devuelve las rutas de archivo
 * para que el agente lea nada mas lo que haga falta.
 *
 *   node .context/graph/context.mjs comunicacion servicio
 *   node .context/graph/context.mjs guardias pernocte --level L2
 *   node .context/graph/context.mjs --tipo RULE --dominio personal
 *   node .context/graph/context.mjs --archivo backend/src/modules/guardias/guardias.service.ts
 *   node .context/graph/context.mjs --tabla guardias.pernoctes
 *   node .context/graph/context.mjs --mapa
 *   node .context/graph/context.mjs permisos --json
 *
 * Niveles:
 *   L0  el mapa: dominios y punteros
 *   L1  resumen: nodos que coinciden + reglas y decisiones que los rigen  (default)
 *   L2  tarea:   + relaciones directas, tablas, endpoints, archivos
 *   L3  profundo:+ cuerpo completo de los nodos curados y segundo salto
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRAPH_DIR = dirname(fileURLToPath(import.meta.url));
const IDX = join(GRAPH_DIR, 'indexes');

function cargar(nombre) {
  const p = join(IDX, nombre);
  if (!existsSync(p)) {
    console.error(`\nFalta ${nombre}. Genera el grafo primero:\n  node .context/graph/build-graph.mjs\n`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(p, 'utf8'));
}

const nodes = cargar('nodes.json');
const caps = cargar('capabilities.json');
const byId = new Map(nodes.map((n) => [n.id, n]));

const edges = (() => {
  const p = join(GRAPH_DIR, 'edges', 'edges.jsonl');
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
})();

const outOf = new Map();
const inOf = new Map();
for (const e of edges) {
  if (!outOf.has(e.from)) outOf.set(e.from, []);
  if (!inOf.has(e.to)) inOf.set(e.to, []);
  outOf.get(e.from).push(e);
  inOf.get(e.to).push(e);
}

// ------------------------------------------------------------------ argumentos

const argv = process.argv.slice(2);
const flag = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(`--${name}`);

const nivel = (flag('level', flag('nivel', has('mapa') ? 'L0' : 'L1')) || 'L1').toUpperCase();
const filtroTipo = flag('tipo')?.toUpperCase();
const filtroDominio = flag('dominio');
const filtroArchivo = flag('archivo');
const filtroTabla = flag('tabla');
const comoJson = has('json');
const maxNodos = Number(flag('max', nivel === 'L3' ? '12' : nivel === 'L2' ? '25' : '40'));

const terminos = argv.filter((a, i) =>
  !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && !has(argv[i - 1].slice(2))));

const NIVEL_ORDEN = { L0: 0, L1: 1, L2: 2, L3: 3 };
if (!(nivel in NIVEL_ORDEN)) {
  console.error(`Nivel invalido: ${nivel}. Usa L0, L1, L2 o L3.`);
  process.exit(1);
}

// ------------------------------------------------------------------- busqueda

const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Peso de un termino segun que tan discriminante sea (IDF).
 * "estado" aparece como columna en decenas de tablas y no dice nada;
 * "pernocte" aparece en pocos nodos y dice mucho.
 */
const TOTAL = nodes.length;
const LOG_TOTAL = Math.log(TOTAL);
function peso(t) {
  const df = caps[t]?.length ?? 0;
  if (!df) return 1;
  const norm = Math.log(TOTAL / df) / LOG_TOTAL;
  return Math.max(0.05, Math.min(1.5, Math.pow(norm, 1.3) * 1.5));
}

function puntuar(n, buscados) {
  let score = 0;
  const nombre = slug(n.nombre);
  const ids = slug(n.id);
  for (const t of buscados) {
    if (!t) continue;
    const w = peso(t);
    let s = 0;
    if (nombre === t || ids.endsWith(`-${t}`)) s += 12;
    else if (nombre.includes(t)) s += 7;
    else if (ids.includes(t)) s += 5;
    // Solo prefijo en una direccion: el termino del nodo extiende al buscado
    // ("comunicacion" encuentra "comunicaciones"). La direccion inversa haria que
    // un termino corto y comun del nodo matchee cualquier busqueda larga.
    if (n.terminos?.includes(t)) s += 4;
    else if (t.length >= 4 && n.terminos?.some((x) => x.startsWith(t))) s += 2;
    if (slug(n.resumen ?? '').includes(t)) s += 2;
    if (n.tabla && slug(n.tabla).includes(t)) s += 4;
    if (n.permisos?.some((p) => slug(p).includes(t))) s += 3;
    score += s * w;
  }
  // los nodos curados son conocimiento que no esta en el codigo: valen mas
  if (n.curado) score *= 1.6;
  if (NIVEL_ORDEN[n.nivel] <= NIVEL_ORDEN[nivel]) score *= 1.15;
  return score;
}

function buscar() {
  let candidatos = nodes;

  if (filtroArchivo) {
    const f = filtroArchivo.replace(/\\/g, '/');
    candidatos = candidatos.filter((n) => n.archivos?.some((a) => a === f || a.endsWith(f) || f.endsWith(a)));
  }
  if (filtroTabla) {
    const t = filtroTabla.toLowerCase();
    candidatos = candidatos.filter((n) => n.tabla?.toLowerCase() === t || n.nombre.toLowerCase() === t);
  }
  if (filtroTipo) candidatos = candidatos.filter((n) => n.tipo === filtroTipo);
  if (filtroDominio) candidatos = candidatos.filter((n) => slug(n.dominio ?? '') === slug(filtroDominio));

  if (!terminos.length) {
    return candidatos
      .sort((a, b) => NIVEL_ORDEN[a.nivel] - NIVEL_ORDEN[b.nivel] || a.tipo.localeCompare(b.tipo))
      .slice(0, maxNodos * 2)
      .map((n) => ({ n, score: 1 }));
  }

  const buscados = terminos.flatMap((t) => slug(t).split('-')).filter((t) => t.length >= 2);

  const puntuados = candidatos
    .map((n) => ({ n, score: puntuar(n, buscados) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // descartar la cola de coincidencias marginales: si el mejor puntaje es alto,
  // un nodo con el 12% de ese puntaje es ruido, no contexto
  const techo = puntuados[0]?.score ?? 0;
  return puntuados.filter((x) => x.score >= techo * 0.12);
}

// --------------------------------------------------------------- expansion

const RELEVANTES = {
  L0: new Set(['belongs_to']),
  L1: new Set(['affects', 'contains', 'constrains', 'belongs_to']),
  L2: new Set(['affects', 'contains', 'constrains', 'belongs_to', 'persisted_in', 'exposes',
    'uses', 'calls', 'reads', 'writes', 'defined_in', 'configured_by', 'depends_on',
    'originates_from', 'references', 'relates_to']),
};
RELEVANTES.L3 = RELEVANTES.L2;

function expandir(semillas) {
  const saltos = nivel === 'L0' ? 0 : nivel === 'L3' ? 2 : 1;
  const relevantes = RELEVANTES[nivel];
  const vistos = new Map(semillas.map((s) => [s.n.id, { nodo: s.n, via: null, desde: null, salto: 0 }]));
  let frontera = semillas.map((s) => s.n.id);

  for (let salto = 1; salto <= saltos; salto++) {
    const siguiente = [];
    for (const id of frontera) {
      for (const e of [...(outOf.get(id) ?? []), ...(inOf.get(id) ?? [])]) {
        if (!relevantes.has(e.tipo)) continue;
        const otro = e.from === id ? e.to : e.from;
        if (vistos.has(otro)) continue;
        const n = byId.get(otro);
        if (!n) continue;
        // en L1 no arrastrar detalle de implementacion
        if (nivel === 'L1' && !['RULE', 'DECISION', 'WORKFLOW', 'DOMAIN', 'ERROR', 'ENTITY'].includes(n.tipo)) continue;
        vistos.set(otro, { nodo: n, via: e.tipo, desde: id, salto });
        siguiente.push(otro);
      }
    }
    frontera = siguiente;
  }
  return vistos;
}

// ------------------------------------------------------------------- salida

const ORDEN_TIPO = ['DOMAIN', 'RULE', 'DECISION', 'WORKFLOW', 'ERROR', 'ENTITY', 'TABLE',
  'API', 'SERVICE', 'SCREEN', 'COMPONENT', 'CONFIGURATION', 'DEPENDENCY', 'FILE', 'PROCEDURE'];

const TITULOS = {
  DOMAIN: 'Dominios', RULE: 'Reglas que aplican', DECISION: 'Decisiones vigentes',
  WORKFLOW: 'Flujos', ERROR: 'Fallas conocidas', ENTITY: 'Entidades', TABLE: 'Tablas',
  API: 'Endpoints', SERVICE: 'Servicios', SCREEN: 'Pantallas', COMPONENT: 'Componentes',
  CONFIGURATION: 'Configuracion', DEPENDENCY: 'Dependencias', FILE: 'Archivos clave',
  PROCEDURE: 'Procedimientos',
};

function cuerpoCurado(n) {
  const p = join(GRAPH_DIR, 'nodes', n.tipo.toLowerCase(), `${n.id}.md`);
  if (!existsSync(p)) return null;
  const m = /^---[\s\S]*?---\r?\n([\s\S]*)$/.exec(readFileSync(p, 'utf8'));
  if (!m) return null;
  return m[1]
    .replace(/^# .*\n/, '')
    .split(/\n## (?:Relaciones|Referenciado por)\n/)[0]
    .replace(/<sub>[\s\S]*?<\/sub>/g, '')
    .trim();
}

function render(semillas, mapa) {
  const L = [];
  const seleccion = [...mapa.values()]
    .sort((a, b) => a.salto - b.salto
      || ORDEN_TIPO.indexOf(a.nodo.tipo) - ORDEN_TIPO.indexOf(b.nodo.tipo)
      || a.nodo.nombre.localeCompare(b.nodo.nombre))
    .slice(0, maxNodos);

  const consulta = [
    terminos.join(' '),
    filtroTipo && `tipo=${filtroTipo}`,
    filtroDominio && `dominio=${filtroDominio}`,
    filtroArchivo && `archivo=${filtroArchivo}`,
    filtroTabla && `tabla=${filtroTabla}`,
  ].filter(Boolean).join(' · ') || '(todo)';

  L.push(`# [CONTEXTO ${nivel}] ${consulta}`, '');

  if (!seleccion.length) {
    L.push('Sin coincidencias. Prueba con otros terminos, o mira el mapa:', '',
      '```bash', 'node .context/graph/context.mjs --mapa', '```');
    return L.join('\n');
  }

  if (nivel === 'L0') {
    const dominios = seleccion.filter((x) => x.nodo.tipo === 'DOMAIN');
    const otros = seleccion.filter((x) => x.nodo.tipo !== 'DOMAIN');
    if (dominios.length) {
      L.push('## Dominios', '');
      for (const { nodo } of dominios) {
        const cuenta = nodes.filter((n) => n.dominio === nodo.dominio).length;
        L.push(`- **${nodo.nombre}** \`${nodo.id}\` — ${cuenta} nodos${nodo.estado && nodo.estado !== 'ACTIVO' ? ` · ${nodo.estado}` : ''}`);
      }
      L.push('');
    }
    if (otros.length) {
      L.push('## Nodos de nivel L0', '');
      for (const { nodo } of otros) L.push(`- \`${nodo.tipo}\` **${nodo.nombre}** — ${nodo.resumen}`);
    }
    return L.join('\n');
  }

  const grupos = new Map();
  for (const x of seleccion) {
    if (!grupos.has(x.nodo.tipo)) grupos.set(x.nodo.tipo, []);
    grupos.get(x.nodo.tipo).push(x);
  }

  for (const tipo of [...grupos.keys()].sort((a, b) => ORDEN_TIPO.indexOf(a) - ORDEN_TIPO.indexOf(b))) {
    L.push(`## ${TITULOS[tipo] ?? tipo}`, '');
    for (const { nodo, via, salto } of grupos.get(tipo)) {
      const marca = salto === 0 ? '' : ` _(via ${via})_`;
      L.push(`### ${nodo.nombre}${marca}`);
      L.push(`\`${nodo.id}\`${nodo.dominio ? ` · dominio: ${nodo.dominio}` : ''}${nodo.severidad ? ` · **${nodo.severidad}**` : ''}${nodo.tabla ? ` · tabla: \`${nodo.tabla}\`` : ''}${nodo.prefijo ? ` · \`${nodo.prefijo}\`` : ''}${nodo.ruta ? ` · \`${nodo.ruta}\`` : ''}`);
      if (nodo.resumen) L.push('', nodo.resumen);

      if (NIVEL_ORDEN[nivel] >= 2) {
        if (nodo.permisos?.length) L.push('', `**Permisos:** ${nodo.permisos.map((p) => `\`${p}\``).join(', ')}`);
        if (nodo.archivos?.length) L.push('', `**Archivos:** ${nodo.archivos.map((a) => `\`${a}\``).join(', ')}`);
      }

      if (nivel === 'L3') {
        if (nodo.curado) {
          const cuerpo = cuerpoCurado(nodo);
          if (cuerpo) L.push('', cuerpo);
        } else {
          L.push('', `_Detalle completo:_ \`.context/graph/nodes/${nodo.tipo.toLowerCase()}/${nodo.id}.md\``);
        }
      }
      L.push('');
    }
  }

  if (NIVEL_ORDEN[nivel] >= 2) {
    const ids = new Set(seleccion.map((x) => x.nodo.id));
    const internas = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
    if (internas.length) {
      L.push('## Como se conectan', '');
      for (const e of internas.slice(0, 60)) {
        L.push(`- ${byId.get(e.from)?.nombre ?? e.from} —**${e.tipo}**→ ${byId.get(e.to)?.nombre ?? e.to}`);
      }
      L.push('');
    }
  }

  const archivos = [...new Set(seleccion.flatMap((x) => x.nodo.archivos ?? []))];
  if (archivos.length) {
    L.push('## Archivos relevantes (leer solo lo necesario)', '');
    for (const a of archivos.slice(0, 40)) L.push(`- \`${a}\``);
    L.push('');
  }

  L.push('---', '');
  if (mapa.size > seleccion.length) {
    L.push(`_Mostrando ${seleccion.length} de ${mapa.size} nodos alcanzados. Sube \`--max\` si hace falta._`, '');
  }
  if (nivel !== 'L3') {
    const sig = nivel === 'L0' ? 'L1' : nivel === 'L1' ? 'L2' : 'L3';
    L.push(`_Si esto no alcanza:_ \`node .context/graph/context.mjs ${terminos.join(' ')} --level ${sig}\``, '');
  }
  L.push('_El grafo indica donde mirar; el codigo es la verdad. Verifica antes de afirmar._');
  return L.join('\n');
}

// ---------------------------------------------------------------------- main

const semillas = buscar().slice(0, nivel === 'L0' ? 60 : Math.max(6, Math.ceil(maxNodos / 2)));
const mapa = expandir(semillas);
const salida = render(semillas, mapa);

if (comoJson) {
  console.log(JSON.stringify({
    consulta: terminos, nivel,
    nodos: [...mapa.values()].slice(0, maxNodos).map((x) => ({ ...x.nodo, _via: x.via, _salto: x.salto })),
    archivos: [...new Set([...mapa.values()].flatMap((x) => x.nodo.archivos ?? []))],
  }, null, 1));
} else {
  console.log(salida);
  // el costo del contexto, para que el ahorro sea medible y no una promesa
  console.error(`\n[~${Math.ceil(salida.length / 4)} tokens · ${mapa.size} nodos alcanzados · nivel ${nivel}]`);
}
