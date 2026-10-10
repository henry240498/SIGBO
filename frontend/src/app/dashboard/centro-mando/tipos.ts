/** Forma de GET /centro-mando (backend: CentroMandoService.panel). */
export type Seccion<T> = { estado: 'ok'; datos: T } | { estado: 'error'; error: string };

export interface Emergencia {
  id: string; numeroServicio: string; tipo: string; estado: string; gravedad: string | null;
  fechaHoraAviso: string; personal: number; enCamino: number; moviles: number; direccion: string | null;
}
export interface Alerta { id: string; tipo: string; solicitanteNombre: string; detalle: string | null; creadoEn: string }
export interface MovilResumen { id: string; numeroInterno: string; alias: string | null; tipo: string }
export interface Moviles {
  total: number;
  disponibles: MovilResumen[];
  enServicio: Array<MovilResumen & { estadoOperativo: string }>;
  noOperativos: Array<MovilResumen & { estado: string }>;
}
export interface PersonalDisponible { alLlamado: number; enBase: number; enCamino: number; enServicio: number; noDisponible: number; total: number }
export interface GuardiaVigente {
  guardiasVigentes: number;
  personal: Array<{ guardiaId: string; bomberoId: string; nombre: string; numeroBombero: string | null; rol: string | null; tipoParticipacion: string; ausente: boolean }>;
}
export interface Convocatoria { id: string; mensaje: string; voy: number; noPuedo: number; menorEtaMinutos: number | null }
export interface MiActividad {
  tienePerfilBombero: boolean;
  proximasGuardias: Array<{ id: string; fecha: string; horaInicio: string; horaFin: string; turno: string; estado: string; rol: string | null }>;
  ultimosServicios: Array<{ id: string; numeroServicio: string; fechaHoraAviso: string; estado: string; tipo: string | null; rol: string | null }>;
}
export interface Pendiente {
  clave: string; titulo: string; cantidad: number | null; detalle: string | null; enlace: string;
  nivel: 'normal' | 'atencion' | 'critico'; error: string | null;
}
export interface ResumenSistema { nivel: 'normal' | 'atencion' | 'critico'; alertas: Array<{ nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }> }

export interface PanelCentroMando {
  generadoEn: string;
  acceso: 'PERMITIDO' | 'SIN_ACCESO';
  motivo: string | null;
  secciones: Partial<{
    accesos: Seccion<null>;
    emergencias: Seccion<{ supervisor: boolean; servicios: Emergencia[] }>;
    alertas: Seccion<Alerta[]>;
    moviles: Seccion<Moviles>;
    personal: Seccion<PersonalDisponible>;
    guardia: Seccion<GuardiaVigente>;
    convocatorias: Seccion<Convocatoria[]>;
    mi_actividad: Seccion<MiActividad>;
    pendientes: Seccion<Pendiente[]>;
    sistema: Seccion<ResumenSistema>;
  }>;
}

export const ETIQUETA_NIVEL: Record<ResumenSistema['nivel'], string> = { normal: 'Normal', atencion: 'Requiere atención', critico: 'Crítico' };
