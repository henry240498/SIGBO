import { AuthenticatedUser } from '../../auth/types/authenticated-user';

export interface ResultadoHerramientaIa {
  /** Texto de respuesta ya redactado en espanol, listo para mostrarse tal
   * cual (el motor le agrega como mucho el saludo/tono de la
   * configuracion) -- nunca datos crudos de la entidad. */
  contenidoRespuesta: string;
  /** Resumen corto para auditoria (ia.ejecuciones_herramientas.datos_consultados_resumen). */
  resumenAuditoria: string;
  /** Fuentes documentales citables, si esta herramienta encontro documentos (seccion 18). */
  fuentes?: Array<{ documentoId: string; titulo: string; numeroDocumental: string | null; enlace: string }>;
}

/** Una herramienta de la lista blanca (secciones 12/45 del pedido). Sin
 * proveedor externo: `patrones`/`palabrasClave` son lo que el motor local
 * (IaMotorService) usa para decidir que herramienta corresponde a un
 * mensaje en espanol -- reemplaza al "tool calling" que antes decidia un
 * LLM. `moduloSlug` respeta `ConfiguracionIa.modulosHabilitadosJson`
 * (restriccion institucional adicional) y `permisoRequerido` es el mismo
 * permiso de SIGBO que ya usan los controllers REST, nunca uno paralelo
 * inventado para la IA. */
export interface AiTool {
  nombre: string;
  descripcion: string;
  moduloSlug: string;
  permisoRequerido: string | null;
  /** Si algun patron matchea el mensaje normalizado, esta herramienta es
   * candidata fuerte (prioridad sobre el puntaje de palabras clave). */
  patrones: RegExp[];
  /** Suman puntaje por cada palabra presente en el mensaje normalizado;
   * desempata/detecta intencion cuando ningun patron especifico matcheo. */
  palabrasClave: string[];
  /** Extrae los argumentos de `ejecutar` a partir del mensaje. Puede
   * devolver un objeto vacio -- no todas las herramientas necesitan
   * parametros (ej. get_institucion, get_guardia_actual). */
  extraerArgumentos: (mensajeNormalizado: string, mensajeOriginal: string) => Record<string, unknown>;
  ejecutar(argumentos: Record<string, unknown>, usuario: AuthenticatedUser): Promise<ResultadoHerramientaIa>;
}
