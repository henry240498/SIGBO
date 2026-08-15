import { EncabezadoInstitucional } from '../../../shared/utils/identidad-institucional';
import { FirmanteResuelto } from '../../../shared/utils/firmantes-institucionales';

/** Snapshot de solo lectura para el reporte PDF/DOCX de una actividad
 * academica (seccion 28 del pedido: actividad, participantes, resultados,
 * instructores, horas). Se arma en el momento de generar el reporte -- no
 * se persiste como "version oficial" congelada (a diferencia de la Orden de
 * Guardia, una actividad puede seguir cambiando despues de reportada). */
export interface ReporteActividadSnapshot {
  generadoEn: string;
  institucional: EncabezadoInstitucional;

  actividad: {
    nombre: string;
    codigo: string | null;
    tipo: string | null;
    modalidad: string | null;
    fechaInicio: string;
    fechaFin: string;
    lugar: string | null;
    descripcion: string | null;
    objetivo: string | null;
    estado: string;
    duracionHoras: number | null;
    esExterna: boolean;
  };

  instructores: Array<{ nombreCompleto: string; tipo: 'PERSONAL' | 'EXTERNO'; rolInstructor: string; detalle: string | null }>;

  participantes: Array<{
    nombreCompleto: string;
    tipo: 'PERSONAL' | 'EXTERNO';
    fechaInscripcion: string;
    estado: string;
    resultado: string | null;
  }>;

  indicadores: {
    totalParticipantes: number;
    porEstado: Record<string, number>;
    porResultado: Record<string, number>;
  };

  firmante: FirmanteResuelto | null;
}
