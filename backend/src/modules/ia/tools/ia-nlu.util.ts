import { Repository } from 'typeorm';
import { TipoBombero } from '../../../shared/entities';

/** Intencion de la consulta, ortogonal a que herramienta responde (seccion
 * 14 del pedido de lenguaje natural). Solo intenciones de LECTURA -- nunca
 * CREAR/MODIFICAR/ELIMINAR, la IA no tiene esas intenciones porque no
 * ejecuta esas acciones. */
export type IntentIa = 'CONTAR' | 'LISTAR' | 'DETALLE';

const PATRONES_CONTAR = [/^cuant[oa]s\b/, /\bcuant[oa]s\b/, /cantidad de/];
const PATRONES_DETALLE = [/^quien es\b/, /^datos de\b/, /^informacion de(l)?\b/, /^detalle de\b/];

/** Devuelve null cuando el mensaje no trae ninguna senal explicita de
 * intencion -- distinto de "LISTAR": una pregunta de seguimiento como "¿y
 * activos?" no repite "cuantos", pero tampoco esta pidiendo una lista, esta
 * agregando un filtro a la intencion de la pregunta anterior (seccion 12).
 * Quien llama decide el default (LISTAR) solo cuando no hay contexto previo
 * del que heredar la intencion -- ver fusionarArgumentos en ia-motor. */
export function detectarIntent(mensajeNormalizado: string): IntentIa | null {
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
