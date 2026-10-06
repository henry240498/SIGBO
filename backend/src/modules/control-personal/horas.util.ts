/** Calculo de horas de servicio y descanso (3.3). Funciones puras: se prueban sin base de datos. */

export interface Tramo {
  guardiaId: string;
  bomberoId: string;
  inicio: Date;
  fin: Date;
}

export interface LimitesHoras {
  horasMaximasPeriodo: number;
  periodoDias: number;
  descansoMinimoHoras: number;
}

export interface ViolacionDescanso {
  guardiaAnteriorId: string;
  guardiaSiguienteId: string;
  descansoHoras: number;
}

export interface ResumenHoras {
  bomberoId: string;
  guardias: number;
  totalHoras: number;
  /** Mayor cantidad de horas dentro de cualquier ventana de `periodoDias`. null sin limites. */
  maximoEnPeriodo: number | null;
  excedeLimite: boolean | null;
  violacionesDescanso: ViolacionDescanso[];
}

const MS_HORA = 3_600_000;
const redondear = (n: number) => Math.round(n * 100) / 100;

function fechaLocal(fecha: string, hora: string): Date {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
  const [hh, mm, ss] = hora.split(':').map((x) => Number(x) || 0);
  return new Date(anio, mes - 1, dia, hh, mm, ss ?? 0);
}

/**
 * Tramo trabajado en una guardia: las horas REALES de entrada y salida si estan
 * ambas cargadas; si no, el horario programado (la salida menor o igual a la
 * entrada es del dia siguiente).
 */
export function tramoDeAsignacion(
  guardia: { id: string; fecha: string; horaInicio: string; horaFin: string },
  asignacion: { bomberoId: string; horaEntrada: Date | null; horaSalida: Date | null },
): Tramo {
  if (asignacion.horaEntrada && asignacion.horaSalida) {
    const inicio = new Date(asignacion.horaEntrada);
    const fin = new Date(asignacion.horaSalida);
    if (fin.getTime() > inicio.getTime()) return { guardiaId: guardia.id, bomberoId: asignacion.bomberoId, inicio, fin };
  }
  const inicio = fechaLocal(guardia.fecha, guardia.horaInicio);
  const fin = fechaLocal(guardia.fecha, guardia.horaFin);
  if (fin.getTime() <= inicio.getTime()) fin.setDate(fin.getDate() + 1);
  return { guardiaId: guardia.id, bomberoId: asignacion.bomberoId, inicio, fin };
}

/** Evalua los tramos de UN bombero. Sin limites solo devuelve los totales. */
export function resumirHoras(bomberoId: string, tramos: Tramo[], limites: LimitesHoras | null): ResumenHoras {
  const ordenados = [...tramos].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  const horas = (t: Tramo) => (t.fin.getTime() - t.inicio.getTime()) / MS_HORA;
  const total = ordenados.reduce((suma, t) => suma + horas(t), 0);

  const resumen: ResumenHoras = {
    bomberoId,
    guardias: ordenados.length,
    totalHoras: redondear(total),
    maximoEnPeriodo: null,
    excedeLimite: null,
    violacionesDescanso: [],
  };
  if (!limites) return resumen;

  // Descanso entre una guardia y la siguiente (solapadas = descanso negativo).
  for (let i = 1; i < ordenados.length; i++) {
    const descanso = (ordenados[i].inicio.getTime() - ordenados[i - 1].fin.getTime()) / MS_HORA;
    if (descanso < limites.descansoMinimoHoras) {
      resumen.violacionesDescanso.push({
        guardiaAnteriorId: ordenados[i - 1].guardiaId,
        guardiaSiguienteId: ordenados[i].guardiaId,
        descansoHoras: redondear(descanso),
      });
    }
  }

  // Mayor carga en una ventana de `periodoDias` que arranca en el inicio de algun tramo.
  const ventanaMs = limites.periodoDias * 24 * MS_HORA;
  let maximo = 0;
  for (const base of ordenados) {
    const limite = base.inicio.getTime() + ventanaMs;
    const suma = ordenados
      .filter((t) => t.inicio.getTime() >= base.inicio.getTime() && t.inicio.getTime() < limite)
      .reduce((s, t) => s + horas(t), 0);
    maximo = Math.max(maximo, suma);
  }
  resumen.maximoEnPeriodo = redondear(maximo);
  resumen.excedeLimite = maximo > limites.horasMaximasPeriodo;
  return resumen;
}
