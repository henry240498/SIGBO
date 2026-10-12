// Adaptador de pruebas Flutter: fuente literal congelada y motor real, sin SQL ni red.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
require(path.join(root, 'backend/node_modules/reflect-metadata'));
const { planDeCarga } = require(path.join(root, 'backend/dist/modules/gre/gre-carga'));
const { MotorMatpelService } = require(path.join(root, 'backend/dist/modules/gre/motor-matpel.service'));
const { geometriaMatpel } = require(path.join(root, 'backend/dist/modules/gre/matpel-geometria'));
const { validarParametrosMatpel, validarContextoConsultaMatpel } = require(path.join(root, 'backend/dist/modules/gre/dto/matpel-consulta.dto'));
const a = JSON.parse(fs.readFileSync(path.join(root, '.context/gre2024/test-cases/motor-fuente.json'))).artefactoRecortado;
const versionGreId = '00000000-0000-4000-8000-000000000001';
let n = 1;
const c = { ...planDeCarga(a, versionGreId, () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`), versionGreId, documento: a.documento };
const motor = new MotorMatpelService();
function evaluar(body) {
  validarParametrosMatpel(body.parametros);
  validarContextoConsultaMatpel(body.entradaIds, { identificaciones: body.identificaciones, ambito: body.ambito });
  const e = motor.evaluar(body.entradaIds, body.parametros, c, { identificaciones: body.identificaciones, ambito: body.ambito });
  return { ...e, versionContrato: 2, geometria: geometriaMatpel(e, body.parametros, c) };
}
if (process.argv.includes('--fixture')) {
  const entrada = c.entradas.find(e => e.identificador === '1005');
  const desconocido = { valor: null, certeza: 'DESCONOCIDO', origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null };
  const parametros = Object.fromEntries(['eventos', 'incendio', 'cantidad', 'contactoAgua', 'periodo', 'contenedor', 'viento', 'ubicacion'].map(k => [k, desconocido]));
  const consulta = { versionGreId, entradaIds: [entrada.id], parametros, ambito: 'DESCONOCIDO', identificaciones: [{ entradaId: entrada.id, certeza: 'NO_CONFIRMADO', metodo: 'MANUAL', observacionOriginal: null, observadoEn: null, evidenciaId: null }] };
  const e = evaluar(consulta);
  process.stdout.write(JSON.stringify({ estado: { estado: 'DISPONIBLE', versionGreId, edicion: a.documento.edicion, documentoSha256: a.documento.sha256 },
    entrada, guia: c.guias.find(g => g.id === entrada.guiaId), bloques: c.bloques.filter(b => b.guiaId === entrada.guiaId),
    ficha: { entrada, guia: c.guias.find(g => g.id === entrada.guiaId), contenedoresTabla3: [], solicitudes: e.solicitudes, guiasLectura: e.guiasLectura },
    paginas: c.paginas, referencias: c.referencias, evaluacion: e }));
} else {
  const b = JSON.parse(fs.readFileSync(0, 'utf8'));
  process.stdout.write(JSON.stringify(evaluar(b)));
}
