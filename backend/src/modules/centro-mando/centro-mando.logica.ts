/** Reglas puras del Centro de mando (spec 2026-10-09 §5.3 y §5.5). */

export const ETIQUETA_ESTADO_BOMBERO: Record<string, string> = {
  ACTIVO: 'Activo', SUSPENDIDO: 'Suspendido', LICENCIA: 'Licencia', BAJA: 'De baja', FALLECIDO: 'Fallecido',
};

/** El personal cuyo estado no esta entre los permitidos no ve nada del Centro de mando. */
export function decidirAcceso(estado: string | null, permitidos: string[]): { acceso: boolean; motivo: string | null } {
  if (!estado) return { acceso: false, motivo: 'Tu usuario está vinculado a una ficha de bombero que no se encontró.' };
  if (permitidos.includes(estado)) return { acceso: true, motivo: null };
  return { acceso: false, motivo: `Tu estado actual (${ETIQUETA_ESTADO_BOMBERO[estado] ?? estado}) no tiene acceso al Centro de mando.` };
}

/** Supervisa (ve todas las emergencias) quien despacha o hace seguimiento. */
export function esSupervisor(permisos: string[]): boolean {
  return permisos.includes('despacho:seguimiento') || permisos.includes('servicios:despachar');
}

export function nivelPorCantidad(cantidad: number, criticos = 0): 'normal' | 'atencion' | 'critico' {
  if (criticos > 0) return 'critico';
  return cantidad > 0 ? 'atencion' : 'normal';
}
