// Medición local con candidato/PDF congelados. Sin SQL, red ni publicación.
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const root = path.resolve(__dirname, '../..');
require(path.join(root, 'backend/node_modules/reflect-metadata'));
const { planDeCarga } = require(path.join(root, 'backend/dist/modules/gre/gre-carga'));
const { MotorMatpelService } = require(path.join(root, 'backend/dist/modules/gre/motor-matpel.service'));
const { paqueteMatpel, partesPaqueteMatpel } = require(path.join(root, 'backend/dist/modules/gre/matpel-paquete'));
const { createHash } = require('node:crypto');
const a = JSON.parse(fs.readFileSync(path.join(root, 'backend/private_uploads/gre/bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af.catalogo-1-busqueda-1-pymupdf1.28.2.json')));
let n = 1; const versionGreId = '00000000-0000-4000-8000-000000000001';
const c = { ...planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`), versionGreId, documento: a.documento };
const pdf = fs.readFileSync(path.join(root, 'docs/Manuales/GRE2024-Spa-Web-a.pdf'));
const parametros = Object.fromEntries(['eventos', 'incendio', 'cantidad', 'contactoAgua', 'periodo', 'contenedor', 'viento', 'ubicacion'].map(k => [k, {valor:null, certeza:'DESCONOCIDO', origen:'OPERADOR', observadoEn:null, evidenciaId:null, fuenteDatoId:null}]));
const motor = new MotorMatpelService(); const id = c.entradas.find(e => e.identificador === '1005' && e.resaltadoVerde).id;
const inicio = performance.now(); motor.evaluar([id], parametros, c); const primeraMs = performance.now() - inicio;
const repetida = performance.now(); for (let i = 0; i < 100; i++) motor.evaluar([id], parametros, c);
const promedioRepetidaMs = (performance.now() - repetida) / 100;
const v1 = paqueteMatpel(c, pdf); const v2 = partesPaqueteMatpel(c, pdf);
const bytesV1 = Buffer.byteLength(JSON.stringify(v1));
const bytesV2 = v2.catalogo.length + v2.pdf.length + v2.interpretacion.length + Buffer.byteLength(JSON.stringify({ manifest: v2.manifest }));
process.stdout.write(JSON.stringify({ tipo:'MEDICION_LOCAL_FUENTE_REAL_NO_TELEFONO_NO_ACEPTACION', node:process.version,
  documentoSha256:createHash('sha256').update(pdf).digest('hex'), entradas:c.entradas.length,
  referencias:c.referencias.length, celdas:c.celdas.length, bytesV1, bytesV2,
  reduccionBytes:bytesV1-bytesV2, reduccionPorcentaje:100*(bytesV1-bytesV2)/bytesV1,
  primeraConsultaMs:primeraMs, promedio100ConsultasMs:promedioRepetidaMs, motorOffline:false,
  manifest:v2.manifest, limites:'Comparación de serialización del mismo catálogo/PDF. No mide HTTP, memoria de Android ni rendimiento de campo.' }, null, 2));
