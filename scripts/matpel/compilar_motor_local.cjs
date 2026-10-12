// Genera el motor Android a partir de las MISMAS fuentes TypeScript del servidor.
// No contiene catálogo, fuente PDF, incidentes ni lógica GRE escrita de nuevo.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const ts = require(path.join(root, 'backend/node_modules/typescript'));
const base = 'backend/src/modules/gre/';
const files = ['motor-matpel.service.ts', 'matpel-modelo.ts', 'matpel-perfil.ts',
  'matpel-recorrido.ts', 'matpel-geometria.ts', 'dto/matpel-consulta.dto.ts'];
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const fuentes = {};
const modules = {};
for (const file of files) {
  const source = fs.readFileSync(path.join(root, base, file), 'utf8');
  fuentes[base + file] = sha(source);
  const id = file.replace(/\.ts$/, '');
  const out = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS,
    experimentalDecorators: true, emitDecoratorMetadata: false,
    esModuleInterop: true, resolveJsonModule: true,
  }, fileName: file, reportDiagnostics: true });
  if (out.diagnostics.some(d => d.category === ts.DiagnosticCategory.Error)) throw Error('No se pudo transpilar ' + file);
  modules[id] = `function(require,module,exports){\n${out.outputText}\n}`;
}
const defsPath = base + 'fuentes/gre2024-definiciones.json';
const defsText = fs.readFileSync(path.join(root, defsPath), 'utf8');
fuentes[defsPath] = sha(defsText);
const defs = JSON.parse(defsText);
const runtimePath = 'scripts/matpel/motor_local_runtime.js';
const runtime = fs.readFileSync(path.join(root, runtimePath), 'utf8');
fuentes[runtimePath] = sha(runtime);
const bundle = `'use strict';\n(function(global){\nconst modules={${Object.entries(modules).map(([k,v]) => JSON.stringify(k)+':'+v).join(',\n')}};\nconst definiciones=${JSON.stringify(defs).replace(/</g, '\\u003c')};\n${runtime}\n})(globalThis);\n`;
const manifest = { schemaVersion: 1, versionMotor: 'gre2024-matpel-2',
  versionInterpretacion: defs.versionInterpretacion, documentoSha256: defs.documentoSha256,
  bundleSha256: sha(bundle), bundleBytes: Buffer.byteLength(bundle), fuentes };
const destino = path.join(root, '.movile/assets/gre');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(path.join(destino, 'motor.js'), 'utf8') !== bundle ||
      fs.readFileSync(path.join(destino, 'motor.json'), 'utf8') !== JSON.stringify(manifest, null, 2)+'\n') {
    throw Error('Motor local desactualizado. Ejecutar node scripts/matpel/compilar_motor_local.cjs');
  }
} else {
  fs.mkdirSync(destino, { recursive: true });
  fs.writeFileSync(path.join(destino, 'motor.js'), bundle);
  fs.writeFileSync(path.join(destino, 'motor.json'), JSON.stringify(manifest, null, 2)+'\n');
}
console.log(JSON.stringify({ actualizado: true, bytes: manifest.bundleBytes, sha256: manifest.bundleSha256 }));
