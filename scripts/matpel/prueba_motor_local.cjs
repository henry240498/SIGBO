// Arnes de MethodChannel para Flutter: ejecuta el bundle REAL, sin HTTP ni SQL.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const ctx = vm.createContext({ SigboCrypto: { sha256: s => crypto.createHash('sha256').update(s).digest('hex') } });
vm.runInContext(fs.readFileSync(path.join(root, '.movile/assets/gre/motor.js'), 'utf8'), ctx);
require('node:readline').createInterface({ input: process.stdin }).on('line', line => {
  process.stdout.write(ctx.SigboMotor.dispatch(line) + '\n');
});
