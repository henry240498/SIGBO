// Adaptadores de plataforma. SHA-256 lo proporciona Android o el arnés de pruebas.
// No evalúa texto descargado ni permite resolver módulos fuera de esta lista.
const cache = {};
class ErrorHttp extends Error { constructor(message) { super(message); this.name = 'ErrorMatpel'; } }
const decorator = () => () => {};
const nest = { BadRequestException: ErrorHttp, NotFoundException: ErrorHttp,
  ServiceUnavailableException: ErrorHttp, Injectable: decorator };
const shims = {
  '@nestjs/common': nest,
  'class-transformer': { Type: decorator },
  'class-validator': new Proxy({}, { get: () => decorator }),
  crypto: { createHash(algorithm) {
    if (algorithm !== 'sha256') throw Error('Algoritmo no admitido.');
    let value = '';
    return { update(s) { if (typeof s !== 'string') throw Error('Huella no textual.'); value += s; return this; },
      digest(format) { if (format !== 'hex') throw Error('Formato no admitido.'); return global.SigboCrypto.sha256(value); } };
  } },
  'gre-artefacto': { mismoId: (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase() },
  'fuentes/gre2024-definiciones.json': definiciones,
};
function load(id, from = '') {
  if (id.startsWith('.')) {
    const parts = (from.split('/').slice(0, -1).join('/') + '/' + id).split('/');
    const clean = []; for (const p of parts) { if (p === '..') clean.pop(); else if (p && p !== '.') clean.push(p); }
    id = clean.join('/');
  }
  if (Object.prototype.hasOwnProperty.call(shims, id)) return shims[id];
  if (cache[id]) return cache[id].exports;
  if (!Object.prototype.hasOwnProperty.call(modules, id)) throw Error('Dependencia de motor no admitida: ' + id);
  const m = { exports: {} }; cache[id] = m; modules[id](dep => load(dep, id), m, m.exports); return m.exports;
}
const { MotorMatpelService } = load('motor-matpel.service');
const { geometriaMatpel } = load('matpel-geometria');
const { perfilMatpel, lecturaGuiasMatpel } = load('matpel-perfil');
const motor = new MotorMatpelService();
let catalogo, manifest;
function inicializar(p) {
  catalogo = undefined; manifest = undefined;
  if (typeof BigInt !== 'function') throw Error('Actualizar Android System WebView para consultar sin conexión.');
  const m = p.manifest, c = p.contenido;
  if (!m || !c || m.documentoSha256 !== definiciones.documentoSha256 ||
      m.versionInterpretacion !== definiciones.versionInterpretacion) throw Error('Edición incompatible con el motor local.');
  for (const parte of ['entradas','guias','bloques','tablas','filas','celdas','reglas','camposFuente','referencias','paginas','secciones']) {
    if (!Array.isArray(c[parte])) throw Error('Edición local incompleta.');
  }
  // Campos de versión omitidos por el exportador documental se restituyen desde
  // el manifiesto ya comprobado, nunca desde el cuerpo de consulta.
  const candidato = { ...c, versionGreId: m.versionGreId, sha256Contenido: m.sha256Contenido,
    documento: { sha256: m.documentoSha256, edicion: m.edicion, idioma: m.idioma } };
  for (const parte of ['entradas','guias','bloques','tablas','filas','celdas','reglas','referencias','paginas','secciones'])
    candidato[parte] = c[parte].map(r => ({ ...r, versionId: m.versionGreId }));
  const perfil = perfilMatpel(candidato);
  if (!perfil.compatible || p.interpretacion?.sha256Definiciones !== perfil.sha256Interpretacion)
    throw Error('La interpretación descargada no coincide con el motor local.');
  catalogo = candidato; manifest = m;
  return { estado: 'DISPONIBLE', versionGreId: m.versionGreId, edicion: m.edicion,
    documentoSha256: m.documentoSha256, modo: 'LOCAL_SIN_CONEXION', validacionOperacional: 'PENDIENTE' };
}
function evaluar(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(k => !['versionGreId','entradaIds','parametros','identificaciones','ambito'].includes(k)))
    throw Error('Contrato local de consulta inválido.');
  if (!catalogo || body.versionGreId !== manifest.versionGreId) throw Error('Versión local incorrecta.');
  const e = motor.evaluar(body.entradaIds, body.parametros, catalogo,
    { identificaciones: body.identificaciones, ambito: body.ambito });
  return { ...e, versionContrato: 2, modoConsulta: 'LOCAL_SIN_CONEXION',
    geometria: geometriaMatpel(e, body.parametros, catalogo) };
}
function ficha(id) {
  const entrada = catalogo.entradas.find(e => e.id === id); if (!entrada) throw Error('Material no disponible.');
  const d = { valor: null, certeza: 'DESCONOCIDO', origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null };
  const parametros = Object.fromEntries(['eventos','incendio','cantidad','contactoAgua','periodo','contenedor','viento','ubicacion'].map(k => [k,d]));
  const e = motor.evaluar([id], parametros, catalogo);
  return { entrada, guia: catalogo.guias.find(g => g.id === entrada.guiaId), solicitudes: e.solicitudes,
    guiasLectura: e.guiasLectura, contenedoresTabla3: catalogo.filas.filter(f => {
      const t = catalogo.tablas.find(t => t.id === f.tablaId), p = JSON.parse(f.condicionesJson || '{}');
      return t?.codigo === 'TABLA_3' && (p.identificadores || []).includes(entrada.identificador);
    }).map(f => ({ id: f.id, nombre: f.etiquetaOriginal, referenciaId: f.referenciaId })) };
}
function dispatch(json) {
  try {
    const p = JSON.parse(json);
    const data = p.accion === 'inicializar' ? inicializar(p.datos) :
      p.accion === 'evaluar' ? evaluar(p.datos) : p.accion === 'ficha' ? ficha(p.datos) :
      (() => { throw Error('Acción local inválida.'); })();
    return JSON.stringify({ ok: true, data });
  } catch (e) { return JSON.stringify({ ok: false, mensaje: e.message || 'No se pudo consultar el motor local.' }); }
}
global.SigboMotor = { inicializar, evaluar, ficha, dispatch,
  lecturaGuia: id => lecturaGuiasMatpel(catalogo, [id])[0] };
