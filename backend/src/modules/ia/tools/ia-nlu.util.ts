import { Repository } from 'typeorm';
import { TipoBombero } from '../../../shared/entities';

/** Intencion de la consulta, ortogonal a que herramienta responde (seccion
 * 14 del pedido de lenguaje natural). Solo intenciones de LECTURA -- nunca
 * CREAR/MODIFICAR/ELIMINAR, la IA no tiene esas intenciones porque no
 * ejecuta esas acciones. */
export type IntentIa = 'CONTAR' | 'LISTAR' | 'DETALLE' | 'ANTIGUEDAD';

const PATRONES_CONTAR = [/^cuant[oa]s\b/, /\bcuant[oa]s\b/, /cantidad de/];
const PATRONES_DETALLE = [/^quien es\b/, /^datos de\b/, /^informacion de(l)?\b/, /^detalle de\b/];
/** "Cuantos anos tiene ESE movil/equipo", "que edad tiene", "de que ano es":
 * pregunta por la antiguedad de una entidad de tercero, no por una cantidad
 * -- distinto de PATRONES_EDAD en ia-motor (esa es autoreferencial, "cuantos
 * anos TENES vos"). Tiene que revisarse ANTES que PATRONES_CONTAR: la frase
 * tambien contiene la palabra "cuantos", que sin este chequeo dispara CONTAR
 * (bug real detectado en vivo: "cuantos anos tiene el movil" devolvia el
 * conteo total de vehiculos en vez de reconocer que la pregunta es por la
 * antiguedad de una unidad puntual). */
const PATRONES_ANTIGUEDAD = [/cuant[oa]s anos tiene/, /que edad tiene/, /que ano tiene/, /de que ano es/, /antiguedad (tiene|de)/];

/** Devuelve null cuando el mensaje no trae ninguna senal explicita de
 * intencion -- distinto de "LISTAR": una pregunta de seguimiento como "¿y
 * activos?" no repite "cuantos", pero tampoco esta pidiendo una lista, esta
 * agregando un filtro a la intencion de la pregunta anterior (seccion 12).
 * Quien llama decide el default (LISTAR) solo cuando no hay contexto previo
 * del que heredar la intencion -- ver fusionarArgumentos en ia-motor. */
export function detectarIntent(mensajeNormalizado: string): IntentIa | null {
  if (PATRONES_ANTIGUEDAD.some((p) => p.test(mensajeNormalizado))) return 'ANTIGUEDAD';
  if (PATRONES_CONTAR.some((p) => p.test(mensajeNormalizado))) return 'CONTAR';
  if (PATRONES_DETALLE.some((p) => p.test(mensajeNormalizado))) return 'DETALLE';
  return null;
}

/** Alias en lenguaje natural -> prefijo real de personal.tipos_bombero
 * (seccion 10 del pedido). El prefijo es el ancla estable; el id real se
 * resuelve siempre contra la base (nunca hardcodeado) para no romper si
 * cambia entre instalaciones. Orden institucional de referencia:
 * BCF > BC > BI > BVAF > BVA > BH > BJ. */
const ALIAS_TIPO_BOMBERO: Array<[string, string]> = [
  ['combatiente fundador', 'BCF'],
  ['combatientes fundadores', 'BCF'],
  ['bombero combatiente fundador', 'BCF'],
  ['fundador', 'BCF'],
  ['fundadores', 'BCF'],
  ['combatiente', 'BC'],
  ['combatientes', 'BC'],
  ['bombero combatiente', 'BC'],
  ['incorporado', 'BI'],
  ['incorporados', 'BI'],
  ['bombero incorporado', 'BI'],
  ['voluntario de apoyo fundador', 'BVAF'],
  ['apoyo fundador', 'BVAF'],
  ['voluntario de apoyo', 'BVA'],
  ['bombero de apoyo', 'BVA'],
  ['honorario', 'BH'],
  ['honorarios', 'BH'],
  ['juvenil', 'BJ'],
  ['juveniles', 'BJ'],
  ['bombero juvenil', 'BJ'],
];

/** Busca el tipo de bombero (BC/BCF/BI/BVAF/BVA/BH/BJ) mencionado en el
 * mensaje. Prueba primero los alias mas largos (evita que "apoyo" matchee
 * antes que "apoyo fundador"), y si ninguno matchea intenta contra el
 * nombre/prefijo real cargado en personal.tipos_bombero -- asi funciona
 * tambien si la institucion agrego un tipo nuevo sin alias todavia. */
export async function resolverTipoBombero(mensajeNormalizado: string, repo: Repository<TipoBombero>): Promise<TipoBombero | null> {
  const alias = [...ALIAS_TIPO_BOMBERO].sort((a, b) => b[0].length - a[0].length);
  for (const [termino, prefijo] of alias) {
    if (mensajeNormalizado.includes(termino)) {
      const tipo = await repo.findOne({ where: { prefijo } });
      if (tipo) return tipo;
    }
  }
  const tipos = await repo.find({ where: { estado: 'ACTIVO' } });
  return (
    tipos.find((t) => mensajeNormalizado.includes(t.nombre.toLowerCase())) ??
    // (?!-?\d): "bc" en "bombero BC-61" NO es el tipo BC, es el prefijo de
    // un codigo puntual (BC-61 es UNA persona, no la categoria). \b solo no
    // alcanza -- el guion ya cuenta como limite de palabra para regex, "bc"
    // dentro de "bc-61" pasaba el \b igual. Sin este chequeo, preguntar por
    // un bombero puntual devolvia TODA la categoria y el codigo se perdia.
    tipos.find((t) => new RegExp(`\\b${t.prefijo.toLowerCase()}\\b(?!-?\\d)`).test(mensajeNormalizado)) ??
    null
  );
}

/** Sinonimos de estado por modulo (seccion 11 del pedido) -- deliberadamente
 * NO es un diccionario global cruzado entre modulos: "activo" en Personal es
 * EstadoBombero.ACTIVO, en Vehiculos es EstadoVehiculo.OPERATIVO; mezclarlos
 * en una sola tabla generaria falsos positivos entre modulos distintos. */
export function resolverSinonimo(mensajeNormalizado: string, sinonimos: Record<string, string>): string | null {
  const terminos = Object.keys(sinonimos).sort((a, b) => b.length - a.length);
  for (const termino of terminos) {
    if (new RegExp(`\\b${termino}\\b`).test(mensajeNormalizado)) return sinonimos[termino];
  }
  return null;
}

export const ESTADO_BOMBERO_SINONIMOS: Record<string, string> = {
  activos: 'ACTIVO', activo: 'ACTIVO', activas: 'ACTIVO', activa: 'ACTIVO', vigentes: 'ACTIVO', vigente: 'ACTIVO',
  suspendidos: 'SUSPENDIDO', suspendido: 'SUSPENDIDO',
  licencia: 'LICENCIA',
  retirados: 'RETIRADO', retirado: 'RETIRADO',
  aspirantes: 'ASPIRANTE', aspirante: 'ASPIRANTE',
};

export const ESTADO_VEHICULO_SINONIMOS: Record<string, string> = {
  disponibles: 'OPERATIVO', disponible: 'OPERATIVO', operativos: 'OPERATIVO', operativo: 'OPERATIVO',
  'fuera de servicio': 'FUERA_SERVICIO',
  'en mantenimiento': 'EN_MANTENIMIENTO', mantenimiento: 'EN_MANTENIMIENTO',
  baja: 'BAJA', 'dados de baja': 'BAJA',
};

export const ESTADO_EQUIPO_SINONIMOS: Record<string, string> = {
  prestados: 'PRESTADO', prestado: 'PRESTADO',
  disponibles: 'OPERATIVO', disponible: 'OPERATIVO', operativos: 'OPERATIVO', operativo: 'OPERATIVO',
  'en mantenimiento': 'EN_MANTENIMIENTO', mantenimiento: 'EN_MANTENIMIENTO',
  danados: 'DANIADO', danado: 'DANIADO', 'dañados': 'DANIADO', 'dañado': 'DANIADO',
  baja: 'BAJA',
};

/** Familia de "verbos de pedido" (Prioridad 4 de la correccion post-auditoria):
 * "detalle de", "detallame", "dame el detalle de", "informacion de",
 * "informacion sobre", "que sabes de", "mostrame", "muestrame", "dame info
 * de" -- todas piden lo mismo con distintas palabras. Se define UNA vez
 * aca y cada herramienta que arma una consulta libre (get_personal,
 * get_vehiculos, get_equipos, get_documentos, get_deposito) la agrega a
 * sus propios disparadores especificos, en vez de que cada una reinvente
 * su propia lista parcial. Antes de esta lista, "detalle del bombero
 * BC-61" fallaba: "detalle" quedaba pegado a la busqueda libre como si
 * fuera parte del nombre buscado (bug real detectado en la auditoria). */
export const DISPARADORES_SOLICITUD: RegExp[] = [
  /detalle(s)? de(l)?/gi,
  /detallame/gi,
  /dame (el|los|la|las) detalle(s)?( de(l)?)?/gi,
  /informacion (de(l)?|sobre)/gi,
  /que sabes de/gi,
  /mostrame/gi,
  /muestrame/gi,
  /dame (info|informacion) (de(l)?|sobre)/gi,
  /decime (sobre|de)/gi,
];

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function formatearFechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sumarDias(base: Date, dias: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias);
}

export interface FechaResuelta {
  fecha: string;
  etiqueta: string;
}

/** Referencias temporales relativas en español para una consulta de UN dia
 * puntual (Prioridad 1, critica, de la correccion post-auditoria): hoy,
 * mañana, pasado mañana, ayer, anteayer, y dias de semana ("el lunes", "el
 * proximo lunes"). Devuelve null si el mensaje no menciona ninguna
 * referencia -- el llamador decide el default (normalmente hoy) SOLO
 * cuando no hay contexto previo del que heredar la fecha: un objeto sin la
 * clave `fecha` no pisa la fecha heredada en fusionarArgumentos (ver
 * ia-motor.service.ts), así que "¿y quién estará el sábado?" reemplaza la
 * fecha, pero un seguimiento que no menciona ninguna fecha nueva conserva
 * la que ya estaba en el contexto en vez de resetear a hoy.
 *
 * Convencion adoptada para "el <dia>" / "el proximo <dia>" / "el <dia>
 * pasado" (ambiguedad real incluso para hispanohablantes -- se documenta
 * la regla, no se pretende resolver la ambiguedad linguistica): "el <dia>"
 * es la proxima ocurrencia CONTANDO HOY (si hoy es lunes, "el lunes" es
 * hoy mismo); "el proximo <dia>" es siempre una semana despues de esa
 * primera ocurrencia; "el <dia> pasado" (Estabilizacion, seccion 2) es la
 * ocurrencia HACIA ATRAS mas cercana, sin contar hoy -- la unica forma de
 * que las tres frases den fechas consistentemente distintas sin adivinar
 * la intencion exacta de cada usuario. */
export function resolverFechaRelativa(mensajeNormalizado: string, ahora: Date = new Date()): FechaResuelta | null {
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  if (/pasado manana/.test(mensajeNormalizado)) return { fecha: formatearFechaLocal(sumarDias(hoy, 2)), etiqueta: 'pasado mañana' };
  if (/anteayer|antier/.test(mensajeNormalizado)) return { fecha: formatearFechaLocal(sumarDias(hoy, -2)), etiqueta: 'anteayer' };
  if (/\bmanana\b/.test(mensajeNormalizado)) return { fecha: formatearFechaLocal(sumarDias(hoy, 1)), etiqueta: 'mañana' };
  if (/\bayer\b/.test(mensajeNormalizado)) return { fecha: formatearFechaLocal(sumarDias(hoy, -1)), etiqueta: 'ayer' };
  if (/\bhoy\b/.test(mensajeNormalizado)) return { fecha: formatearFechaLocal(hoy), etiqueta: 'hoy' };

  const indiceDia = DIAS_SEMANA.findIndex((d) => new RegExp(`\\b${d}\\b`).test(mensajeNormalizado));
  if (indiceDia >= 0) {
    const esProximo = /proximo|proxima|que viene/.test(mensajeNormalizado);
    const esPasado = /pasad[oa]/.test(mensajeNormalizado);
    const diffEstaOcurrencia = (indiceDia - hoy.getDay() + 7) % 7;
    let offset = diffEstaOcurrencia;
    let etiquetaPrefijo = 'el ';
    if (esProximo) {
      offset = diffEstaOcurrencia + 7;
      etiquetaPrefijo = 'el próximo ';
    } else if (esPasado) {
      // Ocurrencia hacia atras: si diffEstaOcurrencia es 0 (hoy mismo dia de
      // semana), "el lunes pasado" dicho un lunes se refiere al lunes
      // anterior (7 dias atras), no a hoy.
      offset = diffEstaOcurrencia === 0 ? -7 : diffEstaOcurrencia - 7;
      etiquetaPrefijo = 'el ';
    }
    const fecha = sumarDias(hoy, offset);
    const fechaTexto = formatearFechaLocal(fecha);
    return { fecha: fechaTexto, etiqueta: `${etiquetaPrefijo}${DIAS_SEMANA[indiceDia]}${esPasado ? ' pasado' : ''} (${fechaTexto})` };
  }

  return null;
}
