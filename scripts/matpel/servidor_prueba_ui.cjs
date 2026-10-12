// Servidor efímero de regresión: solo loopback, recorte literal y motor compilado.
// No importa AppModule, TypeORM ni credenciales; no se conecta a ninguna base.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '../..');
require(path.join(root, 'backend/node_modules/reflect-metadata'));
const { planDeCarga } = require(path.join(root, 'backend/dist/modules/gre/gre-carga'));
const { MotorMatpelService } = require(path.join(root, 'backend/dist/modules/gre/motor-matpel.service'));
const { geometriaMatpel } = require(path.join(root, 'backend/dist/modules/gre/matpel-geometria'));
const { paqueteMatpel, archivoPaqueteMatpel } = require(path.join(root, 'backend/dist/modules/gre/matpel-paquete'));
const { createHash } = require('node:crypto');
const fixture = JSON.parse(fs.readFileSync(path.join(root, '.context/gre2024/test-cases/motor-fuente.json')));
const a = fixture.artefactoRecortado;
const versionGreId = '00000000-0000-4000-8000-000000000001';
let n = 1;
const c = { ...planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`), versionGreId, documento: a.documento };
const motor = new MotorMatpelService();
const html = archivoPaqueteMatpel(paqueteMatpel(c, fs.readFileSync(path.join(root, 'docs/Manuales/GRE2024-Spa-Web-a.pdf'))));
http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/catalogo') {
      response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ c, paginas: a.paginas })); return;
    }
    if (request.method === 'GET' && request.url === '/pdf') {
      response.setHeader('Content-Type', 'application/pdf'); response.end(fs.readFileSync(path.join(root, 'docs/Manuales/GRE2024-Spa-Web-a.pdf'))); return;
    }
    if (request.method === 'GET' && request.url === '/archivo-paquete') {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.setHeader('X-Content-SHA256', createHash('sha256').update(html).digest('hex'));
      response.setHeader('Access-Control-Expose-Headers', 'X-Content-SHA256');
      response.end(html); return;
    }
    if (request.method === 'POST' && request.url === '/evaluar') {
      const chunks = []; let length = 0;
      for await (const chunk of request) { length += chunk.length; if (length > 100000) throw new Error('Consulta demasiado grande.'); chunks.push(chunk); }
      const b = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      const e = motor.evaluar(b.entradaIds, b.parametros, c, { identificaciones: b.identificaciones, ambito: b.ambito });
      response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ ...e, geometria: geometriaMatpel(e, b.parametros, c) })); return;
    }
    response.statusCode = 404; response.end();
  } catch (error) { response.statusCode = 400; response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ message: error.message })); }
}).listen(49545, '127.0.0.1', () => console.log('Regresión MATPEL aislada en loopback:49545, sin base institucional.'));
