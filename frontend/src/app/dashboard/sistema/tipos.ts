/** Respuestas de /sistema/* (backend: SistemaService y RespaldosService) y formatos. */

export interface AlertaSistema { nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }
export interface ResumenSistema { generadoEn: string; nivel: 'normal' | 'atencion' | 'critico'; alertas: AlertaSistema[] }

export interface TrabajoGre {
  activo: boolean; intervaloMs: number | null; ocupado: boolean; ultimaEjecucion: string | null;
  ultimosProcesados: number | null; ultimoError: string | null;
  cola: { tablas: boolean; motivo: string | null; porEstado: Record<string, number> };
}
export interface TrabajoAvisos {
  programado: boolean; intervaloHoras: number; ocupado: boolean; telegramConfigurado: boolean;
  ultimaEjecucion: string | null; ultimosEnviados: number | null; ultimoMotivo: string | null; ultimoError: string | null;
}

export interface EstadoSistema {
  generadoEn: string;
  backend: { version: string | null; node: string; entorno: string; plataforma: string; segundosEncendido: number; memoriaMb: number };
  baseDeDatos: { disponible: boolean; motivo: string | null; latenciaMs: number | null; version: string | null; tamanioMb: number | null };
  inteligencia: {
    disponible: boolean;
    estado: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO' | null;
    ollama: { conectado: boolean; modeloConfigurado?: string | null; modeloDisponible?: boolean; error: string | null } | null;
    whisper: { conectado: boolean; error: string | null } | null;
    piper: { disponible: boolean; error: string | null } | null;
    motivo: string | null;
  };
  telegram: { configurado: boolean };
  tiempoReal: { despacho: { conexiones: number; personas: number }; alertas: { suscriptores: number } };
  trabajos: { gre: TrabajoGre; avisos: TrabajoAvisos };
  matriz: { activa: boolean; sincronizada: boolean; error: string | null; pantallas: number; secciones: number; rutasBackend: number; llamadasSinResolver: number };
}

export interface TareaProgramada {
  nombre: string; existe: boolean; estado: 'LISTA' | 'EN_EJECUCION' | 'DESHABILITADA' | 'DESCONOCIDO' | null;
  ultimaEjecucion: string | null; ultimoResultado: number | null; descripcionResultado: string | null; proximaEjecucion: string | null;
}
export interface LineaRegistro { texto: string; nivel: 'ERROR' | 'WARN' | 'LOG' | 'OTRO' }
/** motivoArranque: por que no hay lineas del arranque automatico (no existe el archivo, o no se pudo leer). */
export interface TareasYTrabajos { tareas: TareaProgramada[] | null; motivoTareas: string | null; arranque: LineaRegistro[]; motivoArranque?: string | null; trabajos: { gre: TrabajoGre; avisos: TrabajoAvisos } }

export interface RespaldoArchivo { nombre: string; fecha: string; tamanioBytes: number; tieneSha256: boolean }
export interface CorridaRespaldo {
  archivo: string | null; tamanio: string | null; sha256: string | null; resultado: 'OK' | 'FALLO' | 'INCOMPLETA';
  pruebaRestauracion: 'OMITIDA' | 'OK' | 'FALLO' | 'DESCONOCIDA'; detalleRestauracion: string | null; avisos: string[];
}
export interface Respaldos {
  disponible: boolean; motivo: string | null; carpeta: string; archivos: RespaldoArchivo[]; corridas: CorridaRespaldo[];
  /** registro.log existe pero no se pudo leer: las corridas no se conocen. */
  motivoRegistro?: string | null;
  alertas: AlertaSistema[]; tarea: TareaProgramada | { disponible: false; motivo: string } | null;
}
export type Migraciones =
  | { disponible: true; total: number; aplicadas: number; pendientes: string[]; alteradas: string[]; desconocidas: string[]; ultimaAplicada: { nombre: string; aplicadaEn: string } | null; comando: string }
  | { disponible: false; motivo: string };

export interface AppMovil {
  disponible: boolean; versionCodigo?: number; versionNombre?: string; obligatoria?: boolean; notas?: string;
  tamanioBytes?: number; sha256?: string; huellaCertificado: string | null;
}
export interface DireccionConexion { nombre: string; ip: string; virtual: boolean; api: string; responde: boolean; qrConectar: string; urlInstalar: string }
export interface ConexionMovil { puerto: number; apkDisponible: boolean; direcciones: DireccionConexion[] }
export interface Registro { clave: string; archivo: string; disponible: boolean; motivo: string | null; actualizadoEn: string | null; lineas: LineaRegistro[] }

export const ETIQUETA_NIVEL = { normal: 'Normal', atencion: 'Requiere atención', critico: 'Crítico' } as const;
export const FONDO_ALERTA = { critica: 'var(--bad-fill)', advertencia: 'var(--warn-fill)', info: 'var(--info-fill)' } as const;
export const ESTADO_TAREA: Record<string, { texto: string; fondo: string }> = {
  LISTA: { texto: 'Lista', fondo: 'var(--ok-fill)' },
  EN_EJECUCION: { texto: 'En ejecución', fondo: 'var(--info-fill)' },
  DESHABILITADA: { texto: 'Deshabilitada', fondo: 'var(--bad-fill)' },
  DESCONOCIDO: { texto: 'Desconocido', fondo: 'var(--neutral-fill)' },
};

/**
 * Por que "Respaldar ahora" no se puede lanzar en este momento (null = se puede). El
 * servidor igual lo rechazaria (409/503): se dice antes, en vez de ofrecer un boton que falla.
 */
const SIN_TAREA_RESPALDO = 'La tarea SIGBO-Respaldo-Diario no está programada en este servidor (se programa con workflows\\scripts\\programar-respaldo.ps1).';

export function motivoSinRespaldo(tarea: Respaldos['tarea']): string | null {
  if (tarea === null) return SIN_TAREA_RESPALDO;
  if ('motivo' in tarea) return `No se puede consultar el Programador de tareas: ${tarea.motivo}`;
  if (!tarea.existe) return SIN_TAREA_RESPALDO;
  if (tarea.estado === 'DESHABILITADA') return 'La tarea de respaldo está deshabilitada en Windows.';
  return null;
}

export function duracion(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '—';
  const d = Math.floor(segundos / 86_400);
  const h = Math.floor((segundos % 86_400) / 3_600);
  const m = Math.floor((segundos % 3_600) / 60);
  if (d) return `${d} d ${h} h`;
  if (h) return `${h} h ${m} min`;
  return `${m} min`;
}

export function tamanio(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function fechaLegible(valor: string | null): string {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(valor));
}
