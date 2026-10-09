/** Prueba SQL aislada. Solo prepara y elimina su propia base nueva en el contenedor
 * local sigbo-sqlserver. Nunca lee contraseñas hacia stdout ni aplica SQL en sigbo_cbvc.
 * Ejecutar desde la raíz: node scripts/matpel/probar_integracion.cjs
 */
const { randomBytes } = require('node:crypto');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const raiz = resolve(__dirname, '../..');
const base = `sigbo_gre_prueba_${randomBytes(8).toString('hex')}`;
const evidencia = resolve(raiz, 'docs/matpel/evidencia/fase3cd');
mkdirSync(evidencia, { recursive: true });
const registro = { iniciadoEn: new Date().toISOString(), entorno: 'Docker local: sigbo-sqlserver',
  base, migraciones: ['094_gre_base_documental.sql'], creada: false, eliminada: false, resultado: 'EN_PROCESO' };
if (!/^sigbo_gre_prueba_[0-9a-f]{16}$/.test(base)) throw new Error('Base de prueba inválida.');

function sql(texto, destino = 'master') {
  const r = spawnSync('docker', ['exec', '-i', '-e', `GRE_DB_PRUEBA=${destino}`, 'sigbo-sqlserver', 'sh', '-c',
    'exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -d "$GRE_DB_PRUEBA"'],
  { input: texto, encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error(r.error?.message || r.stderr || r.stdout || 'Falló SQL de prueba.');
  if (r.stdout.trim()) process.stdout.write(r.stdout);
}

let creada = false;
try {
  console.log(`Base temporal: ${base}`);
  sql(readFileSync(resolve(__dirname, 'db_prueba_gre.sql'), 'utf8').replaceAll('$(BaseGre)', base));
  creada = true;
  registro.creada = true;
  const migracion = readFileSync(resolve(raiz, 'database/migrations/094_gre_base_documental.sql'), 'utf8');
  if (/^\s*USE\s/im.test(migracion)) throw new Error('La migración fija otra base; se detiene la prueba.');
  sql(migracion, base);
  const r = spawnSync(process.execPath, [resolve(raiz, 'backend/node_modules/jest/bin/jest.js'),
    '--runInBand', '--runTestsByPath', 'src/modules/gre/gre-integracion.spec.ts',
    '--json', '--outputFile', resolve(evidencia, 'sql-jest.json')],
  { cwd: resolve(raiz, 'backend'), env: { ...process.env, GRE_DB_PRUEBA: base }, stdio: 'inherit', windowsHide: true });
  if (r.error) throw r.error;
  process.exitCode = r.status ?? 1;
  registro.resultado = r.status === 0 ? 'APROBADO' : 'FALLIDO';
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
  registro.resultado = 'FALLIDO';
} finally {
  if (creada) {
    try {
      sql(`DROP DATABASE [${base}];\nGO\n`);
      console.log(`Base temporal eliminada: ${base}`);
      registro.eliminada = true;
    } catch (e) {
      console.error(`No se pudo eliminar ${base}: ${e.message}`);
      process.exitCode = 1;
    }
  }
  registro.finalizadoEn = new Date().toISOString();
  writeFileSync(resolve(evidencia, 'sql-entorno.json'), JSON.stringify(registro, null, 2) + '\n');
}
