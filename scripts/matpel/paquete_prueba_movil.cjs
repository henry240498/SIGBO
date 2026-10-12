// Consumidor de prueba Flutter: mismo exportador que la API, recorte literal y PDF real.
// Solo stdout hacia el proceso de prueba; no base, importación ni publicación.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
require(path.join(root, 'backend/node_modules/reflect-metadata'));
const { planDeCarga } = require(path.join(root, 'backend/dist/modules/gre/gre-carga'));
const { paqueteMatpel, partesPaqueteMatpel } = require(path.join(root, 'backend/dist/modules/gre/matpel-paquete'));
const a = process.argv.includes('--completo') ? JSON.parse(fs.readFileSync(path.join(root, 'backend/private_uploads/gre/bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af.catalogo-1-busqueda-1-pymupdf1.28.2.json'))) : JSON.parse(fs.readFileSync(path.join(root, '.context/gre2024/test-cases/motor-fuente.json'))).artefactoRecortado;
const versionGreId = '00000000-0000-4000-8000-000000000001'; let n = 1;
const c = { ...planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`), versionGreId, documento: a.documento };
const pdf = fs.readFileSync(path.join(root, 'docs/Manuales/GRE2024-Spa-Web-a.pdf'));
if (process.argv.includes('--partes')) {
  const p = partesPaqueteMatpel(c, pdf);
  process.stdout.write(JSON.stringify({ manifest: p.manifest, catalogoBase64: p.catalogo.toString('base64'),
    pdfBase64: p.pdf.toString('base64'), interpretacionBase64: p.interpretacion.toString('base64') }));
} else process.stdout.write(JSON.stringify(paqueteMatpel(c, pdf)));
