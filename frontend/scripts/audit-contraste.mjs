/**
 * Guarda contra la regresion que dejo el cambio de tema: globals.css pasó a claro y las
 * pantallas se quedaron con la paleta oscura incrustada, asi que el texto secundario
 * quedaba en 2,5:1, los errores en 2,9:1 y los badges con texto --ink sobre fondo oscuro
 * en ~1,5:1. Al no haber pruebas automatizadas, esto es lo unico que avisa si vuelve.
 *
 * Correr: npm run audit:contraste
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const raiz = join(process.cwd(), 'src');
// El login es una portada oscura sobre foto: ahi la paleta oscura es la correcta.
const EXCLUIDOS = [join('src', 'app', 'login')];

/** Colores de texto del tema oscuro retirado: ninguno llega a 4,5:1 sobre tarjeta blanca.
 *  Queda fuera #6b7280: da 4,8:1 (pasa AA) y sus unicos usos son el color por defecto
 *  que el usuario elige para un rango o un rol, o sea dato, no estilo. */
const TEXTO_RETIRADO = /#(94a3b8|e2e8f0|f87171|4ade80|60a5fa|64748b|cbd5e1|fbbf24|facc15|1f2937|263348)\b/gi;
/** Paneles del tema oscuro: se ven como una franja negra dentro de una tarjeta clara. */
const PANEL_RETIRADO = /#(0f172a|1e293b)\b/gi;
/** .badge fija color:var(--ink); un fondo solido oscuro lo vuelve ilegible. */
const BADGE_OSCURO = /className="badge"[^>]*background[^>]*#(7f1d1d|166534|451a03|854d0e|334155|475569|1d4ed8|2563eb)\b/gi;

// Lo que queda es legitimo y esta verificado a mano: la previsualizacion del fondo del
// login dentro del panel de apariencia.
const baseline = Object.freeze({ textoRetirado: 0, panelRetirado: 1, badgeOscuro: 0 });

const archivos = [];
async function recorrer(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) await recorrer(ruta);
    else if (entrada.name.endsWith('.tsx')) archivos.push(ruta);
  }
}
await recorrer(raiz);

let textoRetirado = 0;
let panelRetirado = 0;
let badgeOscuro = 0;
const culpables = [];

for (const archivo of archivos) {
  const rel = relative(process.cwd(), archivo);
  if (EXCLUIDOS.some((ex) => rel.startsWith(ex) || rel.startsWith(ex.split(sep).join('/')))) continue;
  const fuente = await readFile(archivo, 'utf8');
  const t = (fuente.match(TEXTO_RETIRADO) ?? []).length;
  const p = (fuente.match(PANEL_RETIRADO) ?? []).length;
  const b = (fuente.match(BADGE_OSCURO) ?? []).length;
  textoRetirado += t;
  panelRetirado += p;
  badgeOscuro += b;
  if (t || b) culpables.push(`  ${rel} — ${t} de texto, ${b} de badge`);
}

const resultado = { archivos: archivos.length, textoRetirado, panelRetirado, badgeOscuro, baseline };
if (textoRetirado > baseline.textoRetirado || panelRetirado > baseline.panelRetirado || badgeOscuro > baseline.badgeOscuro) {
  console.error('Volvio a entrar paleta del tema oscuro sobre fondo claro.', resultado);
  if (culpables.length) console.error(culpables.join('\n'));
  console.error('\nUsá los tokens de globals.css: --muted, --danger, --success, --warning,\n--signal, --ink, --line, --line-soft, y los tintes --ok/--bad/--warn/--info/--neutral-fill.');
  process.exit(1);
}

console.log('Auditoría de contraste superada.', resultado);
