import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'crypto';
import type { CatalogoMatpel } from './matpel-modelo';
import { perfilMatpel, VERSION_INTERPRETACION_MATPEL } from './matpel-perfil';

const campos: Record<string, string[]> = {
  entradas: ['id', 'nombreOriginal', 'nombreNormalizado', 'identificador', 'tipoIdentificador', 'guiaId', 'polimerizable', 'resaltadoVerde', 'referenciaId'],
  guias: ['id', 'numero', 'tituloOriginal', 'estadoContenido', 'referenciaId'],
  bloques: ['id', 'seccionId', 'guiaId', 'padreId', 'orden', 'encabezadoOriginal', 'textoOriginal', 'referenciaId'],
  tablas: ['id', 'codigo', 'tituloOriginal', 'estructuraJson', 'referenciaId'],
  filas: ['id', 'tablaId', 'entradaId', 'orden', 'etiquetaOriginal', 'condicionesJson', 'referenciaId'],
  celdas: ['id', 'filaId', 'columnaCodigo', 'orden', 'textoOriginal', 'valorDecimal', 'unidadOriginal', 'modificador', 'estadoDato', 'condicionesJson', 'referenciaId'],
  reglas: ['id', 'codigo', 'tipoUso', 'textoOriginal', 'parametrosJson', 'ejecutable', 'versionInterpretacion', 'referenciaId'],
  referencias: ['id', 'paginaPdf', 'textoOriginal', 'cajaPtJson', 'sistemaCoordenadas', 'orientacion', 'estadoRevision'],
  paginas: ['paginaPdf', 'etiquetaPdf', 'etiquetasImpresasJson', 'anchoPt', 'altoPt'],
  secciones: ['id', 'tituloOriginal', 'orden', 'paginaDesde', 'paginaHasta', 'tratamiento'],
  camposFuente: ['campo', 'referenciaId', 'seccionId', 'entradaId', 'guiaId', 'bloqueId', 'tablaId', 'filaId', 'celdaId', 'reglaId'],
};
const cacheCatalogo = new WeakMap<CatalogoMatpel, string>();
const cacheInterpretacion = new WeakMap<CatalogoMatpel, Buffer>();

function contenidoPaquete(c: CatalogoMatpel, pdf: Buffer) {
  if (createHash('sha256').update(pdf).digest('hex') !== c.documento.sha256 || pdf.subarray(0, 5).toString() !== '%PDF-') {
    throw new ServiceUnavailableException('Los bytes del paquete no corresponden a la fuente registrada.');
  }
  const previo = cacheCatalogo.get(c); if (previo) return previo;
  const contenido: Record<string, any> = {};
  for (const [key, keys] of Object.entries(campos)) contenido[key] = (c as any)[key].map((item: any) => Object.fromEntries(keys.map(k => [k, item[k]])));
  const catalogoJson = JSON.stringify(contenido);
  if (Buffer.byteLength(catalogoJson) + pdf.length > 50_000_000) throw new BadRequestException('La edición excede el tamaño admitido por el paquete de consulta local.');
  cacheCatalogo.set(c, catalogoJson);
  return catalogoJson;
}

/** Exporta únicamente contenido/procedencia GRE. No actores, rutas privadas ni incidentes. */
export function paqueteMatpel(c: CatalogoMatpel, pdf: Buffer) {
  const catalogoJson = contenidoPaquete(c, pdf);
  return { manifest: { versionPaquete: 1, versionGreId: c.versionGreId, edicion: c.documento.edicion, idioma: c.documento.idioma,
    generadoEn: new Date().toISOString(), documentoSha256: c.documento.sha256, documentoBytes: pdf.length,
    catalogoSha256: createHash('sha256').update(catalogoJson, 'utf8').digest('hex'), catalogoBytes: Buffer.byteLength(catalogoJson),
    finalidad: 'CONSULTA_DOCUMENTAL_GRE_SIN_DATOS_DE_INCIDENTES', motorDisponibleOffline: false,
    formatoArchivo: 'HTML_AUTOCONTENIDO_CON_PDF' }, catalogoJson, pdfBase64: pdf.toString('base64') };
}

/** Formato2: los mismos bytes documentales, sin PDF base64 ni JSON dentro de JSON. */
export function partesPaqueteMatpel(c: CatalogoMatpel, pdf: Buffer) {
  const catalogo = Buffer.from(contenidoPaquete(c, pdf), 'utf8');
  const perfil = perfilMatpel(c);
  const interpretacion = cacheInterpretacion.get(c) ?? Buffer.from(JSON.stringify({ schemaVersion: 1,
    documentoSha256: c.documento.sha256, versionInterpretacion: VERSION_INTERPRETACION_MATPEL,
    sha256Definiciones: perfil.sha256Interpretacion, compatible: perfil.compatible,
    validacionOperacional: 'PENDIENTE', cantidadesTabla3: perfil.cantidadesTabla3,
    tiposFilaTabla3: perfil.tiposFilaTabla3, reglasDocumentales: perfil.condicionesDocumentales }), 'utf8');
  cacheInterpretacion.set(c, interpretacion);
  const manifest = { versionPaquete: 2, versionGreId: c.versionGreId, edicion: c.documento.edicion,
    sha256Contenido: perfil.sha256Contenido,
    idioma: c.documento.idioma, generadoEn: new Date().toISOString(),
    documentoSha256: c.documento.sha256, documentoBytes: pdf.length,
    catalogoSha256: createHash('sha256').update(catalogo).digest('hex'), catalogoBytes: catalogo.length,
    interpretacionSha256: createHash('sha256').update(interpretacion).digest('hex'), interpretacionBytes: interpretacion.length,
    versionInterpretacion: VERSION_INTERPRETACION_MATPEL,
    finalidad: 'CONSULTA_DOCUMENTAL_GRE_SIN_DATOS_DE_INCIDENTES', motorDisponibleOffline: false,
    formatoArchivo: 'PARTES_DOCUMENTALES_VERIFICABLES' };
  if (catalogo.length + pdf.length + interpretacion.length > 50_000_000) throw new BadRequestException('La edición excede el tamaño admitido.');
  return { manifest, catalogo, pdf, interpretacion };
}

/** Archivo local sin dependencias de red, bibliotecas remotas ni selección automática de distancias. */
export function archivoPaqueteMatpel(paquete: ReturnType<typeof paqueteMatpel>) {
  const datos = JSON.stringify(paquete).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Consulta GRE descargada · SIGBO</title><style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f3f7f8;color:#16324b;font:16px system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:20px}button,input,select{font:inherit;min-height:44px;border:1px solid #8296a7;border-radius:7px;padding:8px;background:white;color:#16324b}button{cursor:pointer}button:hover{background:#e4eef8}section,article{background:white;padding:16px;border:1px solid #c5d3de;border-radius:10px;margin:12px 0}p{line-height:1.5;overflow-wrap:anywhere}.literal{white-space:pre-wrap}.acciones{display:flex;gap:8px;flex-wrap:wrap}li{margin:8px 0}.tabla{overflow-x:auto}table{border-collapse:collapse;width:100%}th,td{border:1px solid #c5d3de;padding:8px;text-align:left}dialog{width:min(1000px,96vw);max-height:94vh;background:white;color:#16324b;border:1px solid #8296a7;border-radius:10px}iframe{border:0;width:100%;height:65vh}h1{font-size:24px}h2{font-size:20px}[hidden]{display:none!important}</style>
<main><h1>Consulta GRE descargada</h1><p id="edicion"></p><p>Lectura documental sin conexión. Elegir el nombre específico y leer las condiciones completas. Las distancias se consultan en la fuente; este archivo no ejecuta el motor ni registra decisiones SCI.</p>
<p id="estado" role="status">Verificando integridad del catálogo y del PDF…</p><div id="consulta" hidden>
<div class="acciones"><button type="button" id="pdf">Abrir PDF completo</button><button type="button" id="indice">Secciones</button></div>
<section><form id="buscar"><label for="q">Identificador ONU/NA, nombre o guía</label><div class="acciones"><input id="q" maxlength="120" required><button type="submit">Buscar</button></div></form><div id="resultados" aria-live="polite"></div></section>
<section id="ficha" hidden></section><section id="contenido" hidden></section></div></main>
<dialog id="fuente" aria-labelledby="titulo-fuente"><h2 id="titulo-fuente">Fuente GRE original</h2><button type="button" id="cerrar">Cerrar y volver</button><p id="pagina"></p><p id="extracto" class="literal"></p><a id="descargar-pdf" download="GRE-original.pdf">Guardar PDF original</a><iframe id="visor" title="PDF original GRE"></iframe></dialog>
<script type="application/json" id="datos">${datos}</script><script>${SCRIPT_OFFLINE}</script></html>`;
}

const SCRIPT_OFFLINE = String.raw`'use strict';
const $ = id => document.getElementById(id);
const paquete = JSON.parse($('datos').textContent);
const m = paquete.manifest;
let c, pdfUrl = '';
const texto = (tag, value, parent) => { const n = document.createElement(tag); n.textContent = value || ''; if (parent) parent.append(n); return n; };
const boton = (label, callback, parent) => { const b = texto('button', label, parent); b.type = 'button'; b.onclick = callback; return b; };
const normalizar = s => s.replace(/(\S)-\n/g, '$1-').normalize('NFD').replace(/\p{M}/gu,'').toUpperCase().replace(/\s+/g,' ').trim();
function fuente(id, pagina) {
  const r = id ? c.referencias.find(r => r.id === id) : null;
  const n = r ? r.paginaPdf : pagina || 1;
  const p = c.paginas.find(p => p.paginaPdf === n);
  const impresas = p ? JSON.parse(p.etiquetasImpresasJson || '[]').map(x => typeof x === 'string' ? x : x.valor || x.textoOriginal || '') : [];
  $('pagina').textContent = 'Página PDF ' + n + ' · Página impresa: ' + (impresas.join(', ') || 'sin numeración');
  $('extracto').textContent = r ? r.textoOriginal : '';
  $('visor').src = pdfUrl + '#page=' + n;
  $('descargar-pdf').href = pdfUrl;
  $('fuente').showModal();
}
function bloques(items, parent) {
  for (const b of items) { const a = texto('article', '', parent); if (b.encabezadoOriginal) texto('h3', b.encabezadoOriginal, a); texto('p', b.textoOriginal, a).className = 'literal'; boton('Ver fuente', () => fuente(b.referenciaId), a); }
}
function guia(g) {
  const el = $('contenido'); el.replaceChildren(); el.hidden = false;
  texto('h2', 'Guía ' + g.numero + ' · ' + (g.tituloOriginal || ''), el);
  boton('Ver fuente de la guía', () => fuente(g.referenciaId), el);
  const bs = c.bloques.filter(b => b.guiaId === g.id).sort((a,b) => a.orden - b.orden);
  if (!bs.length) texto('p', 'Guía intencionalmente vacía: consultar el original.', el);
  bloques(bs, el);
}
function material(e) {
  const el = $('ficha'); el.replaceChildren(); el.hidden = false;
  texto('h2', (e.identificador || 'Sin identificador') + ' · ' + e.nombreOriginal, el);
  texto('p', 'Resaltado verde: ' + (e.resaltadoVerde === null ? 'no determinado' : e.resaltadoVerde ? 'sí' : 'no') + ' · Sufijo P: ' + (e.polimerizable ? 'sí, bajo ciertas condiciones' : e.polimerizable === null ? 'no determinado' : 'no'), el);
  boton('Ver fuente del nombre', () => fuente(e.referenciaId), el);
  const g = c.guias.find(g => g.id === e.guiaId); if (g) boton('Leer guía ' + g.numero + ' completa', () => guia(g), el);
  texto('p', 'Filas que mencionan este identificador. Comprobar nombre, resaltado, condiciones, notas y unidades en el PDF; no hay selección automática de distancia.', el);
  for (const t of c.tablas) {
    const fs = c.filas.filter(f => { const p = JSON.parse(f.condicionesJson || '{}'); return f.tablaId === t.id && (p.identificador === e.identificador || (p.identificadores || []).includes(e.identificador)); }).sort((a,b) => a.orden - b.orden);
    if (!fs.length) continue;
    const details = texto('details', '', el); texto('summary', t.tituloOriginal, details); boton('Ver fuente de la tabla', () => fuente(t.referenciaId), details);
    for (const f of fs) { const a = texto('article', '', details); texto('h3', f.etiquetaOriginal || '', a); boton('Ver fuente de la fila', () => fuente(f.referenciaId), a);
      const ul = texto('ul', '', a);
      const columnas = JSON.parse(t.estructuraJson || '{}').columnas || [];
      for (const v of c.celdas.filter(v => v.filaId === f.id).sort((a,b) => a.orden - b.orden)) {
        const col = columnas.find(x => x.codigo === v.columnaCodigo);
        const nombre = col && col.finalidad ? [col.finalidad === 'AISLAMIENTO' ? 'Aislamiento inicial' : col.finalidad === 'PROTECCION' ? 'Acción protectora' : 'Información original', col.tamanoDerrame === 'PEQUENO' ? 'derrame pequeño' : col.tamanoDerrame === 'GRANDE' ? 'derrame grande' : '', col.periodo === 'DIA' ? 'día' : col.periodo === 'NOCHE' ? 'noche' : '', col.viento ? 'viento ' + col.viento.toLowerCase() : ''].filter(Boolean).join(' · ') : v.columnaCodigo.replaceAll('_',' ').toLowerCase();
        const li = texto('li', nombre + ': ' + v.textoOriginal + (v.unidadOriginal ? ' (' + v.unidadOriginal + ')' : '') + (v.modificador && !v.textoOriginal.includes(v.modificador) ? v.modificador : ''), ul); boton('Ver fuente', () => fuente(v.referenciaId), li);
      }
    }
  }
}
$('buscar').onsubmit = event => {
  event.preventDefault(); const q = normalizar($('q').value); const el = $('resultados'); el.replaceChildren(); $('ficha').hidden = true; $('contenido').hidden = true;
  if (!q || q.length > 120) return;
  if (/^\d{3}$/.test(q)) { const gs = c.guias.filter(g => g.numero === q); gs.forEach(g => boton('Guía ' + g.numero + ' · ' + (g.tituloOriginal || ''), () => guia(g), el)); if (!gs.length) texto('p', 'No se encontró esa guía.', el); return; }
  const es = c.entradas.filter(e => /^\d{4}$/.test(q) ? e.identificador === q : q.length >= 2 && e.nombreNormalizado.includes(q)).sort((a,b) => a.nombreNormalizado.localeCompare(b.nombreNormalizado));
  if (!es.length) { texto('p', 'Sin coincidencias. Material desconocido: consultar guía111.', el); const g = c.guias.find(g => g.numero === '111'); if (g) boton('Leer guía111', () => guia(g), el); }
  const ul = texto('ul', '', el); let mostradas = 0;
  const mas = () => { for (const e of es.slice(mostradas, mostradas + 20)) boton((e.identificador || 'Sin identificador') + ' · ' + e.nombreOriginal, () => material(e), texto('li','',ul)); mostradas += 20; siguiente.hidden = mostradas >= es.length; };
  const siguiente = boton('Más resultados', mas, el); mas();
};
$('indice').onclick = () => {
  const el = $('contenido'); el.replaceChildren(); el.hidden = false; texto('h2','Secciones de la GRE',el);
  const ul = texto('ul','',el);
  for (const s of c.secciones.slice().sort((a,b) => a.orden - b.orden)) boton(s.tituloOriginal + ' · PDF ' + s.paginaDesde + '–' + s.paginaHasta, () => { el.replaceChildren(); texto('h2',s.tituloOriginal,el); boton('Abrir sección en PDF', () => fuente(null,s.paginaDesde),el); bloques(c.bloques.filter(b => b.seccionId === s.id && !b.guiaId).sort((a,b) => a.orden - b.orden),el); }, texto('li','',ul));
};
$('pdf').onclick = () => fuente(null,1);
$('cerrar').onclick = () => $('fuente').close();
window.addEventListener('pagehide', () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); });
async function verificar() {
  if (m.versionPaquete !== 1 || !crypto.subtle) throw new Error('Este navegador no permite comprobar este formato de paquete.');
  const hash = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(x => x.toString(16).padStart(2,'0')).join('');
  const catalogo = new TextEncoder().encode(paquete.catalogoJson);
  if (catalogo.length !== m.catalogoBytes || await hash(catalogo) !== m.catalogoSha256) throw new Error('El catálogo descargado perdió integridad.');
  const data = atob(paquete.pdfBase64); const pdf = Uint8Array.from(data, x => x.charCodeAt(0));
  if (pdf.length !== m.documentoBytes || await hash(pdf) !== m.documentoSha256) throw new Error('El PDF descargado perdió integridad.');
  c = JSON.parse(paquete.catalogoJson); pdfUrl = URL.createObjectURL(new Blob([pdf], {type:'application/pdf'}));
  $('edicion').textContent = 'GRE ' + m.edicion + ' · ' + m.idioma + ' · Descarga ' + m.generadoEn;
  $('estado').textContent = 'Integridad comprobada. Edición descargada; la disponibilidad de una edición posterior no se verifica sin conexión.';
  $('consulta').hidden = false;
}
verificar().catch(error => { $('estado').textContent = error.message; $('consulta').hidden = true; });`;
