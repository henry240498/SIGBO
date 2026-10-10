import { normalizarPatron } from '../../pantallas/matriz-web.logica';

/**
 * Rutas de la API que llama la app móvil, sacadas de .movile/lib/** (api.dart,
 * background.dart, despacho_movil.dart, servicio_activo.dart, gestion.dart, operacion.dart,
 * terreno.dart, reportes.dart, actualizador.dart, conexion.dart). Solo en estas el cliente
 * nativo queda fuera de las reglas de pantallas web: la app tiene su propia matriz (0xA…).
 * En el resto de la API pasa por la matriz web como cualquiera (sin reglas configuradas,
 * nada cambia). Si la app empieza a llamar otra ruta, se agrega acá.
 */

/** Módulos de los que la app usa varias rutas: cualquier método bajo el prefijo. */
export const PREFIJOS_APP_MOVIL = [
  '/auth', '/salud', '/app-movil',
  '/despacho', '/alertas', '/convocatorias', '/flota', '/llamados',
  '/cartografia', '/prevencion', '/reservas', '/ausencias', '/adjuntos',
];

/** Rutas sueltas: método y patrón exactos. */
export const RUTAS_APP_MOVIL = [
  'GET /personal/bomberos', 'GET /seguridad/auditoria', 'GET /aptitudes/vencimientos', 'GET /horas-servicio',
  'GET /indicadores/operativos', 'POST /fichaje/escanear', 'POST /navegacion', 'POST /reportes', 'POST /siniestros/victimas',
];

/** ¿La app móvil llama a esta ruta? `patron` sin el prefijo /api/v1 ('/despacho/solicitudes/:id'). */
export function esRutaDeAppMovil(metodo: string, patron: string): boolean {
  const p = normalizarPatron(patron);
  if (PREFIJOS_APP_MOVIL.some((prefijo) => p === prefijo || p.startsWith(`${prefijo}/`))) return true;
  const m = metodo.toUpperCase() === 'HEAD' ? 'GET' : metodo.toUpperCase();
  return RUTAS_APP_MOVIL.includes(`${m} ${p}`);
}
