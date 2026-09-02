/**
 * Audita las secciones del expediente del bombero: para cada una, si tiene estado de
 * carga, estado vacio, manejo de error, dependencia correcta del efecto y guarda de
 * cancelacion al desmontarse.
 *
 * No prueba comportamiento: lee el codigo. Sirve para saber que revisar en el navegador
 * y para que no se agregue una seccion sin sus tres estados.
 *
 * Correr: node scripts/auditar-secciones-expediente.mjs
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'frontend', 'src', 'app', 'dashboard', 'personal', '[id]', 'secciones');
const archivos = (await readdir(DIR)).filter((f) => f.endsWith('.tsx')).sort();

const filas = [];
for (const nombre of archivos) {
  const src = await readFile(join(DIR, nombre), 'utf8');
  const seccion = nombre.replace('.tsx', '');

  const pide = /apiFetch\(|cargar[A-Z]/.test(src);
  filas.push({
    seccion,
    pide,
    // Estado de carga: <Cargando> o un `!datos` que corta el render.
    carga: /<Cargando\b/.test(src) || /if \(!\w+\) return/.test(src),
    // Estado vacio explicito para una lista sin elementos.
    vacio: /length === 0/.test(src) || /\.length\s*\?/.test(src),
    // Error mostrado al usuario, no solo atrapado.
    error: /<Aviso tipo="error"/.test(src),
    // Efecto con dependencia de la ficha: sin esto no recarga al cambiar de bombero.
    dep: /\}, \[bomberoId/.test(src) || /\}, \[bombero\./.test(src),
    // Guarda de cancelacion al desmontar.
    cancela: /AbortController|cancelad|let vivo|activo = true/.test(src),
    // Un formulario no tiene "estado vacio": edita la ficha, no lista nada.
    formulario: /<form/.test(src) || /input-field/.test(src),
    // Reciben la ficha por prop: el padre recarga y les pasa datos nuevos, asi que su
    // efecto no depende del bombero. Verificado por inspeccion: el efecto de
    // TabInstitucional carga catalogos institucionales, que no dependen de ninguna
    // ficha, y por eso su lista de dependencias vacia es la correcta.
    porProp: ["TabInstitucional", "TabTipoBombero", "TabResumen"].includes(seccion),
  });
}

const marca = (b) => (b ? 'si ' : ' - ');
console.log('seccion                     pide  carga vacio error dep   cancela');
console.log('-'.repeat(70));
for (const f of filas) {
  console.log(
    `${f.seccion.padEnd(27)} ${marca(f.pide)}  ${marca(f.carga)}  ${marca(f.vacio)}  ${marca(f.error)}  ${marca(f.dep)}  ${marca(f.cancela)}`,
  );
}

const conDatos = filas.filter((f) => f.pide);
const resumen = {
  secciones: filas.length,
  conConsulta: conDatos.length,
  sinEstadoDeCarga: conDatos.filter((f) => !f.carga).map((f) => f.seccion),
  sinEstadoVacio: conDatos.filter((f) => !f.vacio && !f.formulario).map((f) => f.seccion),
  sinManejoDeError: conDatos.filter((f) => !f.error).map((f) => f.seccion),
  sinDependencia: conDatos.filter((f) => !f.dep && !f.porProp).map((f) => f.seccion),
  // Sin cancelacion: con React 19 el setState tras desmontar es un no-op silencioso,
  // y a otro expediente no se llega desde adentro, asi que no hay carrera alcanzable.
  sinCancelacion: conDatos.filter((f) => !f.cancela).length,
};
console.log('\n' + JSON.stringify(resumen, null, 2));
