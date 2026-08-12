#!/usr/bin/env node
/**
 * Constructor del grafo de conocimiento de SIGBO.
 *
 * Lee el repositorio real (entidades, migraciones, controladores, servicios,
 * pantallas, configuracion) y emite nodos derivados, aristas e indices.
 * Los nodos curados (RULE/DECISION/WORKFLOW/ERROR/DEPENDENCY) NO se generan:
 * se leen de graph/curated/ y se integran al mismo grafo.
 *
 * Sin dependencias externas. Node >= 18.
 *
 *   node .context/graph/build-graph.mjs [--quiet]
 *
 * Contrato de tipos y aristas: ver SCHEMA.md
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, relative, basename, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRAPH_DIR = dirname(fileURLToPath(import.meta.url));
const CONTEXT_DIR = dirname(GRAPH_DIR);
const REPO = dirname(CONTEXT_DIR);
const QUIET = process.argv.includes('--quiet');

const NODES_DIR = join(GRAPH_DIR, 'nodes');
const EDGES_DIR = join(GRAPH_DIR, 'edges');
const INDEXES_DIR = join(GRAPH_DIR, 'indexes');
const CURATED_DIR = join(GRAPH_DIR, 'curated');

// ---------------------------------------------------------------- utilidades

const log = (...a) => { if (!QUIET) console.log(...a); };

function walk(dir, keep, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.next', 'dist', '.git', '.obsidian'].includes(name)) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, keep, out);
    else if (keep(abs)) out.push(abs);
  }
  return out;
}

const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => relative(REPO, p).split(sep).join('/');

/** Convierte cualquier texto en un fragmento de id estable. */
const slug = (s) => String(s)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'o', 'en', 'por', 'para', 'con',
  'un', 'una', 'que', 'se', 'su', 'al', 'lo', 'como', 'mas', 'sin', 'sobre', 'entity', 'service',
  'controller', 'page', 'tsx', 'ts', 'src', 'app', 'dashboard', 'backend', 'frontend', 'the', 'a']);

function terms(...parts) {
  const bag = new Set();
  for (const part of parts.filter(Boolean)) {
    for (const raw of String(part).split(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9_]+/)) {
      if (!raw) continue;
      for (const piece of raw.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[\s_]+/)) {
        const t = slug(piece);
        if (t.length >= 3 && !STOP.has(t)) bag.add(t);
      }
    }
  }
  return [...bag];
}

/** Primer bloque de documentacion que precede a un ancla, como resumen. */
function docCommentBefore(src, anchorIndex) {
  const head = src.slice(0, anchorIndex);
  const m = [...head.matchAll(/\/\*\*([\s\S]*?)\*\//g)].pop();
  if (!m) return '';
  const body = m[1].replace(/^\s*\*/gm, ' ').replace(/\s+/g, ' ').trim();
  const between = head.slice(m.index + m[0].length);
  if (between.replace(/\s|@\w+\(?[^\n]*\)?/g, '').length > 40) return '';
  return body;
}

const yamlStr = (s) => {
  const v = String(s ?? '').replace(/\r?\n/g, ' ').trim();
  return /^[\w áéíóúüñÁÉÍÓÚÜÑ.,:/()#%+-]*$/.test(v) && !/:\s/.test(v) && !v.startsWith('#')
    ? v : JSON.stringify(v);
};

// ------------------------------------------------------------------- dominios

/** Esquema SQL -> slug de dominio canonico. */
const DOMAIN_OF_SCHEMA = {
  seguridad: 'seguridad', personal: 'personal', organizacion: 'organizacion',
  operaciones: 'asistencia', servicios: 'servicios', vehiculos: 'vehiculos',
  equipos: 'equipos', academia: 'academia', finanzas: 'finanzas',
  deposito: 'deposito', documentos: 'documentos', contenido: 'publicaciones',
  // No hay esquema 'guardias': sus tablas viven en 'operaciones'. El modulo NestJS
  // guardias si es un dominio propio (ver DOMAIN_OF_MODULE y rule--guardias-vive-en-operaciones).
};
/** Carpeta de modulo NestJS -> slug de dominio. */
const DOMAIN_OF_MODULE = {
  auth: 'seguridad', seguridad: 'seguridad', personal: 'personal',
  organizacion: 'organizacion', operaciones: 'asistencia', servicios: 'servicios',
  vehiculos: 'vehiculos', equipos: 'equipos', publicaciones: 'publicaciones',
  configuracion: 'seguridad', guardias: 'guardias',
};
/** Raiz de ruta del frontend que no coincide con el slug de un modulo. */
const DOMAIN_OF_ROUTE = {
  login: 'seguridad', 'mi-perfil': 'seguridad', dashboard: 'seguridad',
};

// --------------------------------------------------------------- acumuladores

const nodes = new Map();
const edges = [];
const warnings = [];

function addNode(node) {
  if (nodes.has(node.id)) { warnings.push(`nodo duplicado: ${node.id}`); return nodes.get(node.id); }
  nodes.set(node.id, { archivos: [], terminos: [], ...node });
  return nodes.get(node.id);
}
function addEdge(from, tipo, to) {
  if (!from || !to || from === to) return;
  edges.push({ from, tipo, to });
}

const idDomain = (d) => `domain--${slug(d)}`;
const idEntity = (f) => `entity--${slug(basename(f).replace(/\.entity\.ts$/, ''))}`;
const idTable = (schema, table) => `table--${slug(schema)}-${slug(table)}`;
const idFile = (p) => `file--${slug(basename(p).replace(/\.[a-z]+$/, ''))}`;

// =============================================================== 1. DOMINIOS

function buildDomains() {
  const src = read(join(REPO, 'frontend/src/lib/modulos.ts'));
  const declared = [...src.matchAll(
    /\{\s*slug:\s*'([^']+)',\s*nombre:\s*'([^']+)',\s*icono:\s*'([^']+)',\s*permisoPrefijo:\s*'([^']+)',\s*disponible:\s*(true|false)/g)];

  for (const [, s, nombre, icono, prefijo, disponible] of declared) {
    addNode({
      id: idDomain(s), tipo: 'DOMAIN', nombre, nivel: 'L0', dominio: slug(s),
      resumen: `Modulo funcional "${nombre}". ${disponible === 'true' ? 'Habilitado en la navegacion.' : 'Declarado pero aun no habilitado (disponible: false).'}`,
      estado: disponible === 'true' ? 'ACTIVO' : 'PLANIFICADO',
      permisoPrefijo: prefijo, icono,
      archivos: ['frontend/src/lib/modulos.ts'],
      terminos: terms(s, nombre, prefijo),
    });
  }
  for (const s of new Set(Object.values(DOMAIN_OF_SCHEMA))) {
    if (!nodes.has(idDomain(s))) {
      addNode({
        id: idDomain(s), tipo: 'DOMAIN', nombre: s, nivel: 'L0', dominio: s,
        estado: 'SOLO_BD',
        resumen: 'Dominio presente en la base de datos y/o el backend pero no declarado en el menu del frontend.',
        terminos: terms(s),
      });
    }
  }
  log(`  DOMAIN   ${declared.length} declarados en modulos.ts`);
}

// =============================================================== 2. ENTIDADES

function buildEntities() {
  const files = walk(join(REPO, 'backend/src/shared/entities'), (p) => p.endsWith('.entity.ts'));
  for (const f of files) {
    const src = read(f);
    // Independiente del orden de las claves y de los espacios: hay entidades escritas
    // como {name:'x',schema:'y'} y otras como {schema:'y',name:'x'}.
    const ent = /@Entity\(\{([^}]*)\}\)/.exec(src);
    const cls = /export class (\w+)/.exec(src);
    const table = ent && (/name:\s*'([^']+)'/.exec(ent[1]) ?? [])[1];
    const schema = ent && (/schema:\s*'([^']+)'/.exec(ent[1]) ?? [])[1];
    if (!ent || !cls || !table || !schema) {
      warnings.push(`entidad sin @Entity/class parseable: ${rel(f)}`);
      continue;
    }
    const dominio = DOMAIN_OF_SCHEMA[schema] ?? schema;

    const enums = [...src.matchAll(/export type (\w+)\s*=\s*([^;]+);/g)]
      .map(([, n, v]) => ({ nombre: n, valores: [...v.matchAll(/'([^']+)'/g)].map((m) => m[1]) }))
      .filter((e) => e.valores.length);

    const columns = [...src.matchAll(/@Column\(\{([^}]*)\}\)\s*(?:\/\*[\s\S]*?\*\/\s*)?(\w+)[?!]?:/g)]
      .map(([, opts, name]) => ({
        nombre: name,
        tipo: (/type:\s*'([^']+)'/.exec(opts) ?? [, '?'])[1],
        nullable: /nullable:\s*true/.test(opts),
      }));

    const relations = [...src.matchAll(/@(ManyToOne|OneToMany|OneToOne|ManyToMany)\(\(\)\s*=>\s*(\w+)/g)]
      .map(([, kind, target]) => ({ kind, target }));

    const id = idEntity(f);
    const node = addNode({
      id, tipo: 'ENTITY', nombre: cls[1], nivel: 'L1', dominio,
      resumen: docCommentBefore(src, ent.index) || `Entidad ${cls[1]}, persistida en ${schema}.${table}.`,
      tabla: `${schema}.${table}`,
      columnas: columns.length,
      enums, relaciones: relations,
      camposClave: columns.slice(0, 12).map((c) => c.nombre),
      archivos: [rel(f)],
      terminos: terms(cls[1], table, schema, ...enums.flatMap((e) => [e.nombre, ...e.valores])),
    });

    // La arista a la tabla se resuelve en linkEntitiesToTables(), cuando ya se
    // conoce el esquema resultante de aplicar todas las migraciones.
    node._tablaEsperada = { schema, table };
    addEdge(id, 'belongs_to', idDomain(dominio));
    node._relTargets = relations.map((r) => r.target);
  }

  const byClass = new Map([...nodes.values()].filter((n) => n.tipo === 'ENTITY').map((n) => [n.nombre, n.id]));
  for (const n of nodes.values()) {
    if (n.tipo !== 'ENTITY') continue;
    for (const target of n._relTargets ?? []) {
      const to = byClass.get(target);
      if (to) addEdge(n.id, 'relates_to', to);
    }
    delete n._relTargets;
  }
  log(`  ENTITY   ${files.length}`);
}

// ================================================================= 3. TABLAS

/**
 * Reproduce el esquema aplicando las migraciones EN ORDEN, no solo leyendo los
 * CREATE TABLE. Una tabla renombrada con sp_rename debe aparecer con su nombre
 * actual: si no, el grafo describe un esquema que ya no existe.
 */
function buildTables() {
  const migrations = walk(join(REPO, 'database/migrations'), (p) => p.endsWith('.sql')).sort();
  const tablas = new Map();
  const renombres = [];

  for (const f of migrations) {
    const src = read(f);
    const mig = basename(f);
    const fileId = idFile(f);
    addNode({
      id: fileId, tipo: 'FILE', nombre: mig, nivel: 'L2',
      resumen: (/Migraci[oó]n\s*\d+\s*[-–]\s*([^\n*]+)/i.exec(src) ?? [])[1]?.replace(/\s+/g, ' ').trim()
        || `Migracion SQL ${mig}.`,
      archivos: [rel(f)],
      terminos: terms(basename(f, '.sql')),
    });

    for (const m of src.matchAll(/CREATE TABLE\s+\[?(\w+)\]?\.\[?(\w+)\]?\s*\(([\s\S]*?)\n\s*\)\s*;/gi)) {
      const [, schema, table, body] = m;
      const key = `${schema.toLowerCase()}.${table.toLowerCase()}`;
      const cols = [...body.matchAll(/^\s{2,}(\w+)\s+([A-Z]+(?:\([^)]*\))?)/gm)]
        .filter(([, n]) => !/^(CONSTRAINT|PRIMARY|FOREIGN|UNIQUE|CHECK|INDEX)$/i.test(n))
        .map(([, n, t]) => ({ nombre: n, tipo: t }));
      tablas.set(key, {
        esquema: schema, tabla: table, columnas: cols,
        fks: [...body.matchAll(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+\[?(\w+)\]?\.\[?(\w+)\]?/gi)]
          .map(([, col, s, t]) => ({ columna: col.trim(), destino: `${s}.${t}` })),
        checks: [...body.matchAll(/CONSTRAINT\s+\w+\s+CHECK\s*\(([\s\S]*?)\)(?=,\n|\s*\n\s*\))/gi)]
          .map(([, expr]) => expr.replace(/\s+/g, ' ').trim()),
        uniques: [...body.matchAll(/CONSTRAINT\s+\w+\s+UNIQUE\s*\(([^)]+)\)/gi)]
          .map(([, c]) => c.replace(/\s+/g, ' ').trim()),
        creadaEn: mig, creadaEnId: fileId, modificadaPor: [], renombradaDe: null,
      });
    }

    // sp_rename de TABLA
    for (const m of src.matchAll(/sp_rename\s+'(\w+)\.(\w+)'\s*,\s*'(\w+)'\s*(?:;|\n|$)/gi)) {
      const [full, schema, vieja, nueva] = m;
      if (/'COLUMN'/i.test(full)) continue;
      const oldKey = `${schema.toLowerCase()}.${vieja.toLowerCase()}`;
      const hecho = tablas.get(oldKey);
      if (!hecho) { warnings.push(`sp_rename sobre tabla desconocida: ${oldKey} (${mig})`); continue; }
      tablas.delete(oldKey);
      hecho.tabla = nueva;
      hecho.renombradaDe = `${schema}.${vieja}`;
      hecho.modificadaPor.push(mig);
      tablas.set(`${schema.toLowerCase()}.${nueva.toLowerCase()}`, hecho);
      renombres.push({ de: `${schema}.${vieja}`, a: `${schema}.${nueva}`, mig });
    }

    // sp_rename de COLUMNA
    for (const m of src.matchAll(/sp_rename\s+'(\w+)\.(\w+)\.(\w+)'\s*,\s*'(\w+)'\s*,\s*'COLUMN'/gi)) {
      const [, schema, table, vieja, nueva] = m;
      const hecho = tablas.get(`${schema.toLowerCase()}.${table.toLowerCase()}`);
      if (!hecho) continue;
      const col = hecho.columnas.find((c) => c.nombre.toLowerCase() === vieja.toLowerCase());
      if (col) col.nombre = nueva;
      if (!hecho.modificadaPor.includes(mig)) hecho.modificadaPor.push(mig);
    }

    // ALTER TABLE: columnas agregadas y eliminadas
    for (const m of src.matchAll(/ALTER TABLE\s+\[?(\w+)\]?\.\[?(\w+)\]?\s+([\s\S]*?);/gi)) {
      const [, schema, table, cuerpo] = m;
      const hecho = tablas.get(`${schema.toLowerCase()}.${table.toLowerCase()}`);
      if (!hecho) continue;
      if (!hecho.modificadaPor.includes(mig)) hecho.modificadaPor.push(mig);

      for (const d of cuerpo.matchAll(/DROP COLUMN\s+\[?(\w+)\]?/gi)) {
        hecho.columnas = hecho.columnas.filter((c) => c.nombre.toLowerCase() !== d[1].toLowerCase());
      }
      const add = /^\s*ADD\s+([\s\S]+)$/i.exec(cuerpo);
      if (add && !/CONSTRAINT/i.test(add[1].slice(0, 12))) {
        for (const a of add[1].matchAll(/(?:^|,)\s*(\w+)\s+([A-Z]+(?:\([^)]*\))?)/gi)) {
          const nombre = a[1];
          if (/^(CONSTRAINT|DEFAULT|NOT|NULL|FOR|CHECK|UNIQUE|PRIMARY|FOREIGN)$/i.test(nombre)) continue;
          if (!hecho.columnas.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
            hecho.columnas.push({ nombre, tipo: a[2], agregadaEn: mig });
          }
        }
      }
      for (const c of cuerpo.matchAll(/ADD CONSTRAINT\s+\w+\s+CHECK\s*\(([\s\S]*?)\)\s*$/gi)) {
        hecho.checks.push(c[1].replace(/\s+/g, ' ').trim());
      }
    }

    for (const m of src.matchAll(/DROP TABLE\s+(?:IF EXISTS\s+)?\[?(\w+)\]?\.\[?(\w+)\]?/gi)) {
      tablas.delete(`${m[1].toLowerCase()}.${m[2].toLowerCase()}`);
    }
  }

  for (const hecho of tablas.values()) {
    const { esquema, tabla } = hecho;
    const id = idTable(esquema, tabla);
    const dominio = DOMAIN_OF_SCHEMA[esquema.toLowerCase()] ?? esquema.toLowerCase();
    const archivos = [...new Set([hecho.creadaEn, ...hecho.modificadaPor])]
      .map((m) => `database/migrations/${m}`);

    addNode({
      id, tipo: 'TABLE', nombre: `${esquema}.${tabla}`, nivel: 'L2', dominio,
      resumen: `Tabla ${esquema}.${tabla} (${hecho.columnas.length} columnas). Creada en ${hecho.creadaEn}`
        + (hecho.renombradaDe ? `, renombrada desde ${hecho.renombradaDe}` : '')
        + (hecho.modificadaPor.length ? `, modificada por ${hecho.modificadaPor.join(', ')}` : '') + '.',
      esquema, tabla,
      columnas: hecho.columnas, fks: hecho.fks, checks: hecho.checks, uniques: hecho.uniques,
      renombradaDe: hecho.renombradaDe, modificadaPor: hecho.modificadaPor,
      archivos,
      terminos: terms(esquema, tabla, hecho.renombradaDe ?? '', ...hecho.columnas.map((c) => c.nombre)),
    });
    addEdge(id, 'defined_in', hecho.creadaEnId);
    addEdge(id, 'belongs_to', idDomain(dominio));
    for (const fk of hecho.fks) {
      const [s2, t2] = fk.destino.split('.');
      addEdge(id, 'references', idTable(s2, t2));
    }
  }

  for (const r of renombres) warnings.push(`tabla renombrada: ${r.de} -> ${r.a} (${r.mig})`);
  log(`  TABLE    ${tablas.size} tras aplicar ${migrations.length} migraciones (${renombres.length} renombre/s)`);
}

/**
 * Une cada entidad con su tabla real. Si la tabla no existe tras aplicar las
 * migraciones, la entidad queda marcada como huerfana en vez de generar una
 * arista hacia un nodo inexistente: es un hallazgo, no un enlace roto.
 */
function linkEntitiesToTables() {
  let huerfanas = 0;
  for (const n of nodes.values()) {
    if (n.tipo !== 'ENTITY' || !n._tablaEsperada) continue;
    const { schema, table } = n._tablaEsperada;
    const tid = idTable(schema, table);
    if (nodes.has(tid)) {
      addEdge(n.id, 'persisted_in', tid);
    } else {
      n.huerfana = true;
      n.resumen = `${n.resumen} ATENCION: apunta a ${schema}.${table}, que no existe tras aplicar las migraciones.`;
      warnings.push(`entidad huerfana: ${n.nombre} -> ${schema}.${table} (tabla inexistente)`);
      huerfanas++;
    }
    delete n._tablaEsperada;
  }
  if (huerfanas) log(`  AVISO    ${huerfanas} entidad(es) sin tabla real`);
}

// ====================================================== 4. API + SERVICE + MODULE

const permisosIndex = new Map();
function notePermiso(code, nodeId) {
  if (!permisosIndex.has(code)) permisosIndex.set(code, new Set());
  permisosIndex.get(code).add(nodeId);
}

function buildBackendCode() {
  const moduleDir = join(REPO, 'backend/src/modules');
  const files = walk(moduleDir, (p) => /\.(controller|service|module)\.ts$/.test(p));
  const moduleOf = (p) => relative(moduleDir, p).split(sep)[0];

  const controllers = files.filter((p) => p.endsWith('.controller.ts'));
  const services = files.filter((p) => p.endsWith('.service.ts'));
  const modules = files.filter((p) => p.endsWith('.module.ts'));

  for (const f of modules) {
    const mod = moduleOf(f);
    const src = read(f);
    const id = `component--modulo-${slug(mod)}`;
    addNode({
      id, tipo: 'COMPONENT', nombre: `${mod} (modulo NestJS)`, nivel: 'L1',
      dominio: DOMAIN_OF_MODULE[mod] ?? slug(mod),
      resumen: `Modulo NestJS que cablea controladores, servicios y repositorios de ${mod}.`,
      capa: 'backend',
      entidadesRegistradas: [...src.matchAll(/TypeOrmModule\.forFeature\(\[([\s\S]*?)\]\)/g)]
        .flatMap(([, list]) => list.split(',').map((s) => s.trim()).filter(Boolean)),
      archivos: [rel(f)],
      terminos: terms(mod, 'modulo'),
    });
    addEdge(id, 'belongs_to', idDomain(DOMAIN_OF_MODULE[mod] ?? mod));
  }

  const serviceIdByClass = new Map();
  for (const f of services) {
    const mod = moduleOf(f);
    const src = read(f);
    const cls = (/export class (\w+)/.exec(src) ?? [, basename(f)])[1];
    const id = `service--${slug(mod)}-${slug(basename(f).replace(/\.service\.ts$/, ''))}`;
    const repos = [...src.matchAll(/InjectRepository\((\w+)\)/g)].map((m) => m[1]);
    const injectedServices = [...src.matchAll(/private\s+readonly\s+\w+:\s*(\w*Service)/g)].map((m) => m[1]);
    const dominio = DOMAIN_OF_MODULE[mod] ?? slug(mod);

    addNode({
      id, tipo: 'SERVICE', nombre: cls, nivel: 'L2', dominio,
      resumen: docCommentBefore(src, src.indexOf('export class')) ||
        `Logica de negocio de ${basename(f).replace(/\.service\.ts$/, '').replace(/-/g, ' ')} (modulo ${mod}).`,
      capa: 'backend',
      metodosPublicos: [...src.matchAll(/^\s{2}(?:async\s+)?([a-z]\w*)\s*\(/gm)].map((m) => m[1])
        .filter((n) => n !== 'constructor'),
      repositorios: repos,
      archivos: [rel(f)],
      terminos: terms(cls, mod, basename(f).replace(/\.service\.ts$/, ''), ...repos),
    });
    serviceIdByClass.set(cls, id);
    addEdge(id, 'belongs_to', idDomain(dominio));
    addEdge(id, 'uses', `component--modulo-${slug(mod)}`);
    for (const r of repos) {
      const ent = [...nodes.values()].find((n) => n.tipo === 'ENTITY' && n.nombre === r);
      if (ent) {
        addEdge(id, 'uses', ent.id);
        const tid = idTable(...String(ent.tabla).split('.'));
        if (nodes.has(tid)) addEdge(id, 'reads', tid);
      }
    }
    nodes.get(id)._injected = injectedServices;
  }
  for (const n of nodes.values()) {
    if (n.tipo !== 'SERVICE') continue;
    for (const cls of n._injected ?? []) {
      const to = serviceIdByClass.get(cls);
      if (to) addEdge(n.id, 'uses', to);
    }
    delete n._injected;
  }

  for (const f of controllers) {
    const mod = moduleOf(f);
    const src = read(f);
    const prefix = (/@Controller\('([^']*)'\)/.exec(src) ?? [, ''])[1];
    const cls = (/export class (\w+)/.exec(src) ?? [, basename(f)])[1];
    const id = `api--${slug(mod)}-${slug(basename(f).replace(/\.controller\.ts$/, ''))}`;
    const dominio = DOMAIN_OF_MODULE[mod] ?? slug(mod);

    const rutas = [];
    const verbRe = /@(Get|Post|Put|Patch|Delete)\(\s*'?([^')]*)'?\s*\)([\s\S]{0,400}?)(?=@(?:Get|Post|Put|Patch|Delete)\(|\n\}\s*$)/g;
    for (const m of src.matchAll(verbRe)) {
      const [, verbo, sub, tail] = m;
      const perms = [...tail.matchAll(/@RequirePermission\(([^)]*)\)/g)]
        .flatMap(([, args]) => [...args.matchAll(/'([^']+)'/g)].map((x) => x[1]));
      const ruta = `/${[prefix, sub].filter(Boolean).join('/')}`.replace(/\/+/g, '/');
      rutas.push({ verbo, ruta, permisos: perms });
      perms.forEach((p) => notePermiso(p, id));
    }
    const todosPermisos = [...new Set(rutas.flatMap((r) => r.permisos))];

    addNode({
      id, tipo: 'API', nombre: cls, nivel: 'L2', dominio,
      resumen: docCommentBefore(src, src.indexOf('export class')) ||
        `Superficie HTTP de ${basename(f).replace(/\.controller\.ts$/, '').replace(/-/g, ' ')} bajo /api/v1/${prefix}.`,
      capa: 'backend',
      prefijo: `/api/v1/${prefix}`.replace(/\/+$/, ''),
      rutas, permisos: todosPermisos,
      archivos: [rel(f)],
      terminos: terms(cls, mod, prefix, basename(f).replace(/\.controller\.ts$/, ''), ...todosPermisos),
    });
    addEdge(id, 'belongs_to', idDomain(dominio));

    for (const [, svcCls] of src.matchAll(/private\s+readonly\s+\w+:\s*(\w*Service)/g)) {
      const to = serviceIdByClass.get(svcCls);
      if (to) addEdge(id, 'exposes', to);
    }
  }
  log(`  API      ${controllers.length}   SERVICE ${services.length}   COMPONENT(modulo) ${modules.length}`);
}

// =========================================================== 5. FRONTEND

function buildFrontend() {
  const appDir = join(REPO, 'frontend/src/app');
  const pages = walk(appDir, (p) => /[\\/]page\.tsx$/.test(p));

  for (const f of pages) {
    const src = read(f);
    const route = '/' + relative(appDir, dirname(f)).split(sep).join('/');
    const cleanRoute = route === '/.' ? '/' : route;
    const seg = cleanRoute.split('/').filter((s) => s && s !== 'dashboard' && !s.startsWith('['));
    const crudo = seg.length ? slug(seg[0]) : 'seguridad';
    const dominio = nodes.has(idDomain(crudo)) ? crudo
      : (DOMAIN_OF_MODULE[crudo] ?? DOMAIN_OF_ROUTE[crudo] ?? 'seguridad');
    const id = `screen--${slug(cleanRoute) || 'raiz'}`;

    const llamadas = [...new Set([...src.matchAll(/apiFetch\(\s*[`'"]([^`'"$]+)/g)].map((m) => m[1]))];
    const permisos = [...new Set([...src.matchAll(/'([a-z_]+:[a-z_]+)'/g)].map((m) => m[1]))];
    permisos.forEach((p) => notePermiso(p, id));

    addNode({
      id, tipo: 'SCREEN', nombre: cleanRoute, nivel: 'L1', dominio,
      resumen: `Pantalla ${cleanRoute}${llamadas.length ? `, consume ${llamadas.length} endpoint(s).` : '.'}`,
      capa: 'frontend',
      ruta: cleanRoute, llamadas, permisos,
      archivos: [rel(f)],
      terminos: terms(cleanRoute.replace(/\//g, ' '), ...permisos),
    });
    addEdge(id, 'belongs_to', idDomain(dominio));
  }

  // COMPONENT: helpers de frontend/src/lib y componentes compartidos
  for (const f of [...walk(join(REPO, 'frontend/src/lib'), (p) => p.endsWith('.ts')),
                   ...walk(join(REPO, 'frontend/src/app/components'), (p) => p.endsWith('.tsx'))]) {
    const src = read(f);
    const base = basename(f).replace(/\.(ts|tsx)$/, '');
    const id = `component--front-${slug(base)}`;
    const exports = [...src.matchAll(/export (?:async )?(?:function|const|type|interface) (\w+)/g)].map((m) => m[1]);
    addNode({
      id, tipo: 'COMPONENT', nombre: base, nivel: 'L2',
      dominio: nodes.has(idDomain(base)) ? slug(base) : undefined,
      resumen: docCommentBefore(src, 0) || `Helper de frontend "${base}" (${exports.length} exportaciones).`,
      capa: 'frontend', exports,
      archivos: [rel(f)],
      terminos: terms(base, ...exports.slice(0, 20)),
    });
  }

  // SCREEN --uses--> COMPONENT segun los imports de @/lib y @/app/components
  for (const n of nodes.values()) {
    if (n.tipo !== 'SCREEN') continue;
    const src = read(join(REPO, n.archivos[0]));
    for (const m of src.matchAll(/from\s+'@\/(?:lib\/([\w-]+)|app\/components\/([\w-]+))'/g)) {
      addEdge(n.id, 'uses', `component--front-${slug(m[1] ?? m[2])}`);
    }
  }

  // SCREEN --calls--> API por coincidencia de prefijo mas largo
  const apis = [...nodes.values()].filter((n) => n.tipo === 'API')
    .map((n) => ({ id: n.id, p: n.prefijo.replace('/api/v1', '') }))
    .sort((a, b) => b.p.length - a.p.length);
  for (const n of nodes.values()) {
    if (n.tipo !== 'SCREEN') continue;
    for (const call of n.llamadas ?? []) {
      const hit = apis.find((a) => a.p && call.startsWith(a.p));
      if (hit) addEdge(n.id, 'calls', hit.id);
    }
  }
  log(`  SCREEN   ${pages.length}`);
}

// ======================================================= 6. CONFIGURACION

function buildConfiguration() {
  const f = join(REPO, 'backend/src/modules/configuracion/configuracion.registry.ts');
  if (existsSync(f)) {
    const src = read(f);
    const defs = [...src.matchAll(/d\(\{([^}]*?)\}\)/g)].map(([, body]) => {
      const g = (k) => (new RegExp(`${k}:\\s*'([^']*)'`).exec(body) ?? [, null])[1];
      const raw = (k) => (new RegExp(`${k}:\\s*([^,}]+)`).exec(body) ?? [, null])[1];
      return {
        key: g('key'), nombre: g('nombre'), categoria: g('categoria'),
        nivel: g('nivel'), tipo: g('tipo'), defaultValue: raw('defaultValue'),
        permission: g('permission'), publico: raw('public') === 'true',
      };
    }).filter((d) => d.key);

    const porCategoria = new Map();
    for (const d of defs) {
      if (!porCategoria.has(d.categoria)) porCategoria.set(d.categoria, []);
      porCategoria.get(d.categoria).push(d);
    }
    for (const [cat, items] of porCategoria) {
      const id = `configuration--${slug(cat)}`;
      addNode({
        id, tipo: 'CONFIGURATION', nombre: `Configuracion: ${cat}`, nivel: 'L2', dominio: 'seguridad',
        resumen: `${items.length} parametro(s) de la categoria "${cat}", niveles: ${[...new Set(items.map((i) => i.nivel))].join(', ')}.`,
        claves: items.map((i) => ({ key: i.key, nombre: i.nombre, nivel: i.nivel, tipo: i.tipo, default: i.defaultValue, permiso: i.permission })),
        archivos: [rel(f)],
        terminos: terms(cat, ...items.flatMap((i) => [i.key, i.nombre])),
      });
      addEdge(id, 'belongs_to', idDomain('seguridad'));
      items.filter((i) => i.permission).forEach((i) => notePermiso(i.permission, id));
    }
    log(`  CONFIG   ${defs.length} claves en ${porCategoria.size} categorias`);
  }

  const ds = join(REPO, 'backend/src/core/database/data-source-options.ts');
  if (existsSync(ds)) {
    const src = read(ds);
    addNode({
      id: 'configuration--conexion-datos', tipo: 'CONFIGURATION',
      nombre: 'Conexion a SQL Server (TypeORM)', nivel: 'L2', dominio: 'seguridad',
      resumen: 'Opciones del DataSource: pool, timeouts, naming strategy y synchronize:false.',
      variables: [...new Set([...src.matchAll(/process\.env\.(\w+)/g)].map((m) => m[1]))],
      archivos: [rel(ds)],
      terminos: terms('conexion', 'datasource', 'typeorm', 'sqlserver', 'pool', 'timeout', 'mssql'),
    });
  }
}

// ============================================================ 7. CURADOS

/** Parser de frontmatter YAML acotado a lo que este grafo usa. */
function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    const item = /^\s*-\s*(.*)$/.exec(line);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      if (v === '') data[key] = [];
      else if (/^\[.*\]$/.test(v)) {
        data[key] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      } else data[key] = v.replace(/^['"]|['"]$/g, '');
    } else if (item && key) {
      if (!Array.isArray(data[key])) data[key] = [];
      let v = item[1].trim();
      if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
      else v = v.replace(/^['"]|['"]$/g, '');
      data[key].push(v);
    }
  }
  return { data, body: m[2].trim() };
}

function buildCurated() {
  const files = walk(CURATED_DIR, (p) => p.endsWith('.md'));
  for (const f of files) {
    const { data, body } = parseFrontmatter(read(f));
    if (!data.id || !data.tipo) { warnings.push(`curado sin id/tipo: ${rel(f)}`); continue; }
    addNode({
      id: data.id, tipo: data.tipo, nombre: data.nombre ?? data.id,
      nivel: data.nivel ?? 'L2', dominio: data.dominio,
      resumen: data.resumen ?? '', estado: data.estado,
      fuente: data.fuente, severidad: data.severidad,
      curado: true, cuerpo: body,
      archivos: Array.isArray(data.archivos) ? data.archivos : (data.archivos ? [data.archivos] : []),
      terminos: [...new Set([...(Array.isArray(data.terminos) ? data.terminos : []),
        ...terms(data.nombre, data.resumen)])],
    });
    for (const e of data.edges ?? []) {
      const pair = Array.isArray(e) ? e : String(e).replace(/^\[|\]$/g, '').split(',').map((s) => s.trim());
      if (pair.length === 2) addEdge(data.id, pair[0], pair[1]);
    }
    if (data.dominio) addEdge(data.id, 'belongs_to', idDomain(data.dominio));
  }
  const byType = {};
  for (const n of nodes.values()) if (n.curado) byType[n.tipo] = (byType[n.tipo] ?? 0) + 1;
  log(`  CURATED  ${files.length} archivos -> ${JSON.stringify(byType)}`);
}

// ======================================================== 8. ESCRITURA

function nodeToMarkdown(n) {
  const fm = [];
  const push = (k, v) => { if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)) fm.push(`${k}: ${v}`); };

  push('id', n.id);
  push('tipo', n.tipo);
  push('nombre', yamlStr(n.nombre));
  push('nivel', n.nivel);
  push('dominio', n.dominio);
  push('estado', n.estado);
  push('resumen', yamlStr(n.resumen));
  if (n.tabla) push('tabla', n.tabla);
  if (n.prefijo) push('prefijo', n.prefijo);
  if (n.ruta) push('ruta', n.ruta);
  if (n.capa) push('capa', n.capa);
  if (n.severidad) push('severidad', n.severidad);
  if (n.permisos?.length) push('permisos', `[${n.permisos.join(', ')}]`);
  if (n.archivos?.length) fm.push('archivos:', ...n.archivos.map((a) => `  - ${a}`));

  const outEdges = edges.filter((e) => e.from === n.id);
  if (outEdges.length) fm.push('edges:', ...outEdges.map((e) => `  - [${e.tipo}, ${e.to}]`));
  if (n.terminos?.length) push('terminos', `[${n.terminos.slice(0, 40).join(', ')}]`);

  const out = [`---`, ...fm, `---`, ``, `# ${n.nombre}`, ``];
  if (n.resumen) out.push(n.resumen, ``);
  if (n.curado && n.cuerpo) out.push(n.cuerpo, ``);

  if (n.tipo === 'ENTITY') {
    out.push(n.huerfana
      ? `- **Tabla:** \`${n.tabla}\` — **no existe** tras aplicar las migraciones. Entidad huerfana: probable codigo muerto o migracion faltante.`
      : `- **Tabla:** [[${idTable(...String(n.tabla).split('.'))}|${n.tabla}]]`);
    out.push(`- **Columnas mapeadas:** ${n.columnas}`);
    if (n.enums?.length) {
      out.push(``, `## Estados y enumeraciones`, ``);
      for (const e of n.enums) out.push(`- \`${e.nombre}\`: ${e.valores.map((v) => `\`${v}\``).join(' · ')}`);
    }
    if (n.relaciones?.length) {
      out.push(``, `## Relaciones TypeORM`, ``);
      for (const r of n.relaciones) out.push(`- \`@${r.kind}\` → ${r.target}`);
    }
  }

  if (n.tipo === 'TABLE') {
    out.push(`- **Esquema:** ${n.esquema} · **Columnas:** ${n.columnas?.length ?? 0}`);
    if (n.uniques?.length) out.push(`- **UNIQUE:** ${n.uniques.map((u) => `\`${u}\``).join(', ')}`);
    if (n.checks?.length) {
      out.push(``, `## Restricciones CHECK (reglas que la BD impone)`, ``);
      for (const c of n.checks) out.push(`- \`${c}\``);
    }
    if (n.fks?.length) {
      out.push(``, `## Llaves foraneas`, ``);
      for (const fk of n.fks) out.push(`- \`${fk.columna}\` → [[${idTable(...fk.destino.split('.'))}|${fk.destino}]]`);
    }
    if (n.columnas?.length) {
      out.push(``, `## Columnas`, ``, `| Columna | Tipo |`, `|---|---|`);
      for (const c of n.columnas) out.push(`| ${c.nombre} | ${c.tipo} |`);
    }
  }

  if (n.tipo === 'API') {
    out.push(`- **Prefijo:** \`${n.prefijo}\``);
    if (n.rutas?.length) {
      out.push(``, `## Rutas`, ``, `| Verbo | Ruta | Permiso exigido |`, `|---|---|---|`);
      for (const r of n.rutas) out.push(`| ${r.verbo.toUpperCase()} | \`${r.ruta}\` | ${r.permisos.length ? r.permisos.map((p) => `\`${p}\``).join(' o ') : '—'} |`);
    }
  }

  if (n.tipo === 'SERVICE' && n.metodosPublicos?.length) {
    out.push(``, `## Metodos`, ``, n.metodosPublicos.map((m) => `\`${m}()\``).join(' · '));
  }

  if (n.tipo === 'SCREEN') {
    out.push(`- **Ruta:** \`${n.ruta}\``);
    if (n.permisos?.length) out.push(`- **Permisos referenciados:** ${n.permisos.map((p) => `\`${p}\``).join(', ')}`);
    if (n.llamadas?.length) {
      out.push(``, `## Endpoints que consume`, ``);
      for (const c of n.llamadas) out.push(`- \`${c}\``);
    }
  }

  if (n.tipo === 'CONFIGURATION' && n.claves?.length) {
    out.push(``, `## Claves`, ``, `| Clave | Nivel | Tipo | Default | Permiso |`, `|---|---|---|---|---|`);
    for (const k of n.claves) out.push(`| \`${k.key}\` | ${k.nivel} | ${k.tipo} | \`${k.default}\` | ${k.permiso ? `\`${k.permiso}\`` : '—'} |`);
  }
  if (n.tipo === 'CONFIGURATION' && n.variables?.length) {
    out.push(``, `## Variables de entorno`, ``, n.variables.map((v) => `\`${v}\``).join(' · '));
  }

  if (n.tipo === 'COMPONENT' && n.entidadesRegistradas?.length) {
    out.push(``, `## Entidades registradas (forFeature)`, ``, n.entidadesRegistradas.join(', '));
  }

  if (n.archivos?.length) {
    out.push(``, `## Archivos`, ``);
    for (const a of n.archivos) out.push(`- \`${a}\``);
  }

  if (outEdges.length) {
    out.push(``, `## Relaciones`, ``);
    for (const e of outEdges) {
      const t = nodes.get(e.to);
      out.push(`- \`${e.tipo}\` → [[${e.to}${t ? `|${t.nombre}` : ''}]]`);
    }
  }
  const inEdges = edges.filter((e) => e.to === n.id);
  if (inEdges.length) {
    out.push(``, `## Referenciado por`, ``);
    for (const e of inEdges.slice(0, 60)) {
      const fnode = nodes.get(e.from);
      out.push(`- [[${e.from}${fnode ? `|${fnode.nombre}` : ''}]] \`${e.tipo}\` →`);
    }
  }

  out.push(``, `---`, `<sub>Nodo ${n.curado ? '**curado** (editable a mano)' : 'derivado — generado por `build-graph.mjs`, no editar a mano'}.</sub>`);
  return out.join('\n');
}

function write() {
  for (const d of [NODES_DIR, EDGES_DIR, INDEXES_DIR]) {
    if (existsSync(d)) rmSync(d, { recursive: true, force: true });
    mkdirSync(d, { recursive: true });
  }

  for (const n of nodes.values()) {
    const dir = join(NODES_DIR, n.tipo.toLowerCase());
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${n.id}.md`), nodeToMarkdown(n) + '\n', 'utf8');
  }

  const seen = new Set();
  const unique = edges.filter((e) => {
    const k = `${e.from}|${e.tipo}|${e.to}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  writeFileSync(join(EDGES_DIR, 'edges.jsonl'),
    unique.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf8');

  const porTipo = {};
  for (const e of unique) porTipo[e.tipo] = (porTipo[e.tipo] ?? 0) + 1;

  const list = [...nodes.values()].map((n) => ({
    id: n.id, tipo: n.tipo, nombre: n.nombre, dominio: n.dominio ?? null,
    nivel: n.nivel, resumen: n.resumen ?? '',
    archivos: n.archivos ?? [], terminos: n.terminos ?? [],
    curado: !!n.curado,
    ...(n.estado ? { estado: n.estado } : {}),
    ...(n.severidad ? { severidad: n.severidad } : {}),
    ...(n.huerfana ? { huerfana: true } : {}),
    ...(n.tabla ? { tabla: n.tabla } : {}),
    ...(n.prefijo ? { prefijo: n.prefijo } : {}),
    ...(n.ruta ? { ruta: n.ruta } : {}),
    ...(n.permisos?.length ? { permisos: n.permisos } : {}),
  }));
  writeFileSync(join(INDEXES_DIR, 'nodes.json'), JSON.stringify(list), 'utf8');

  const byType = {};
  const byDomain = {};
  for (const n of list) {
    (byType[n.tipo] ??= []).push(n.id);
    if (n.dominio) (byDomain[n.dominio] ??= []).push(n.id);
  }
  writeFileSync(join(INDEXES_DIR, 'by-type.json'), JSON.stringify(byType, null, 1), 'utf8');
  writeFileSync(join(INDEXES_DIR, 'by-domain.json'), JSON.stringify(byDomain, null, 1), 'utf8');

  const caps = {};
  for (const n of list) for (const t of n.terminos) (caps[t] ??= []).push(n.id);
  writeFileSync(join(INDEXES_DIR, 'capabilities.json'), JSON.stringify(caps), 'utf8');

  const byFile = {};
  for (const n of list) for (const f of n.archivos) (byFile[f] ??= []).push(n.id);
  writeFileSync(join(INDEXES_DIR, 'files.json'), JSON.stringify(byFile, null, 1), 'utf8');

  const tables = {};
  for (const n of nodes.values()) {
    if (n.tipo !== 'TABLE') continue;
    const entidad = [...nodes.values()].find((e) => e.tipo === 'ENTITY' && e.tabla === n.nombre);
    tables[n.nombre] = {
      id: n.id, dominio: n.dominio,
      entidad: entidad ? { id: entidad.id, clase: entidad.nombre } : null,
      migracion: n.archivos[0] ?? null,
      columnas: n.columnas?.length ?? 0,
      fks: (n.fks ?? []).map((f) => f.destino),
    };
  }
  writeFileSync(join(INDEXES_DIR, 'tables.json'), JSON.stringify(tables, null, 1), 'utf8');

  const perms = {};
  for (const [code, ids] of [...permisosIndex].sort()) {
    perms[code] = { modulo: code.split(':')[0], exigidoPor: [...ids] };
  }
  writeFileSync(join(INDEXES_DIR, 'permissions.json'), JSON.stringify(perms, null, 1), 'utf8');

  const huecos = {
    tablasSinEntidad: Object.entries(tables).filter(([, v]) => !v.entidad).map(([k]) => k),
    entidadesSinTabla: [...nodes.values()].filter((n) => n.tipo === 'ENTITY' && n.huerfana)
      .map((n) => `${n.nombre} -> ${n.tabla}`),
    dominiosSinPantalla: [...nodes.values()].filter((n) => n.tipo === 'DOMAIN' &&
      ![...nodes.values()].some((s) => s.tipo === 'SCREEN' && s.dominio === n.dominio)).map((n) => n.nombre),
    dominiosSinApi: [...nodes.values()].filter((n) => n.tipo === 'DOMAIN' &&
      ![...nodes.values()].some((s) => s.tipo === 'API' && s.dominio === n.dominio)).map((n) => n.nombre),
  };

  const stats = {
    generado: new Date().toISOString(),
    repo: basename(REPO),
    nodos: nodes.size,
    aristas: unique.length,
    nodosPorTipo: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.length])),
    aristasPorTipo: porTipo,
    permisos: Object.keys(perms).length,
    terminosIndexados: Object.keys(caps).length,
    huecos,
    advertencias: warnings,
  };
  writeFileSync(join(INDEXES_DIR, 'stats.json'), JSON.stringify(stats, null, 1), 'utf8');
  return stats;
}

// ==================================================================== main

log(`\nSIGBO · construccion del grafo de conocimiento`);
log(`repo: ${REPO}\n`);

buildDomains();
buildEntities();
buildTables();
linkEntitiesToTables();
buildBackendCode();
buildFrontend();
buildConfiguration();
buildCurated();

const stats = write();

log(`\n  ${stats.nodos} nodos · ${stats.aristas} aristas · ${stats.permisos} permisos · ${stats.terminosIndexados} terminos`);
log(`  ${JSON.stringify(stats.nodosPorTipo)}`);
if (warnings.length) {
  log(`\n  ${warnings.length} advertencia(s):`);
  warnings.slice(0, 10).forEach((w) => log(`    - ${w}`));
}
log(`\n  escrito en .context/graph/{nodes,edges,indexes}\n`);
