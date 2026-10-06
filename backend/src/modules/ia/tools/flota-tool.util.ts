/**
 * Logica de la herramienta get_flota de Snoopy (solo lectura): que moviles estan
 * en el cuartel, despachados, en servicio o regresando. Separada de
 * IaToolsService para poder probarla sin la base de datos ni el motor de lenguaje.
 */

export type FiltroFlota = 'EN_CUARTEL' | 'DESPACHADO' | 'EN_SERVICIO' | 'REGRESANDO' | 'FUERA_DEL_CUARTEL' | null;

/** Frases que activan la herramienta. Deliberadamente especificas del estado OPERATIVO
 * del movil, para no pisar a get_vehiculos (estado administrativo: operativo, en mantenimiento...). */
export const PATRONES_FLOTA: RegExp[] = [
  /moviles (en servicio|despachados|afuera|en la calle|en el cuartel|en cuartel|regresando|volviendo)/,
  /(que|cuales|cuantos) (moviles|vehiculos) (salieron|estan afuera|estan en servicio|estan despachados|estan en el cuartel|estan en cuartel|estan regresando)/,
  /(moviles|vehiculos) (listos|libres) para salir/,
  /estado operativo (de la flota|de los moviles)/,
  /donde estan los moviles/,
  /(que|cuales) moviles (salieron|estan en la calle)/,
];

/** Interpreta que estado operativo pregunta el mensaje (ya normalizado, sin tildes ni mayusculas). */
export function filtroDeMensaje(mensaje: string): FiltroFlota {
  if (/regres|volvi/.test(mensaje)) return 'REGRESANDO';
  if (/despachad/.test(mensaje)) return 'DESPACHADO';
  if (/en servicio/.test(mensaje)) return 'EN_SERVICIO';
  if (/afuera|calle|salieron|salio/.test(mensaje)) return 'FUERA_DEL_CUARTEL';
  if (/cuartel|libres|listos/.test(mensaje)) return 'EN_CUARTEL';
  return null;
}

export interface MovilFlota {
  numeroInterno: string;
  alias: string | null;
  estado: string;
  estadoOperativo: string;
  estadoOperativoDesde: Date | null;
}

const ETIQUETA: Record<string, string> = {
  EN_CUARTEL: 'en el cuartel',
  DESPACHADO: 'despachado',
  EN_SERVICIO: 'en servicio',
  REGRESANDO: 'regresando',
};

function hace(desde: Date | null, ahora: Date): string {
  if (!desde) return '';
  const min = Math.max(0, Math.round((ahora.getTime() - new Date(desde).getTime()) / 60000));
  return min < 60 ? `, hace ${min} min` : `, hace ${Math.floor(min / 60)} h ${min % 60} min`;
}

/** Texto de respuesta y resumen de auditoria. Los moviles de baja no se cuentan. */
export function responderFlota(todos: MovilFlota[], filtro: FiltroFlota, ahora: Date = new Date()) {
  const moviles = todos.filter((m) => m.estado !== 'BAJA');
  if (moviles.length === 0) {
    return { contenidoRespuesta: 'No tengo moviles cargados en SIGBO.', resumenAuditoria: 'Flota -> sin moviles' };
  }
  const coincide = (m: MovilFlota) => {
    if (filtro === null) return true;
    if (filtro === 'FUERA_DEL_CUARTEL') return m.estadoOperativo !== 'EN_CUARTEL';
    return m.estadoOperativo === filtro;
  };
  const elegidos = moviles.filter(coincide);
  const nombre = (m: MovilFlota) => (m.alias ? `${m.numeroInterno} (${m.alias})` : m.numeroInterno);

  if (filtro === null) {
    const lineas = moviles.map((m) => `- ${nombre(m)}: ${ETIQUETA[m.estadoOperativo] ?? m.estadoOperativo}${hace(m.estadoOperativoDesde, ahora)}${m.estado !== 'OPERATIVO' ? ` (${m.estado.toLowerCase().replace('_', ' ')})` : ''}`);
    return { contenidoRespuesta: `Estado operativo de la flota (${moviles.length} moviles):\n${lineas.join('\n')}`, resumenAuditoria: `Flota -> estado de ${moviles.length} moviles` };
  }

  const descripcion =
    filtro === 'FUERA_DEL_CUARTEL' ? 'fuera del cuartel' : ETIQUETA[filtro];
  if (elegidos.length === 0) {
    return { contenidoRespuesta: `No hay moviles ${descripcion} en este momento.`, resumenAuditoria: `Flota -> 0 ${descripcion}` };
  }
  const lista = elegidos.map((m) => `- ${nombre(m)}${filtro === 'FUERA_DEL_CUARTEL' ? `: ${ETIQUETA[m.estadoOperativo]}` : ''}${hace(m.estadoOperativoDesde, ahora)}`);
  const advertencia =
    filtro === 'EN_CUARTEL' && elegidos.some((m) => m.estado !== 'OPERATIVO')
      ? '\nOjo: algunos de ellos no estan operativos (mantenimiento o fuera de servicio) y no pueden salir.'
      : '';
  return {
    contenidoRespuesta: `Hay ${elegidos.length} movil${elegidos.length === 1 ? '' : 'es'} ${descripcion}:\n${lista.join('\n')}${advertencia}`,
    resumenAuditoria: `Flota -> ${elegidos.length} ${descripcion}`,
  };
}
