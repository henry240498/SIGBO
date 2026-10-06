import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Ausencia,
  AsignacionGuardia,
  Bombero,
  Convocatoria,
  ConvocatoriaRespuesta,
  Guardia,
  Vehiculo,
} from '../../shared/entities';

const ESTADOS_GUARDIA_NO_VIGENTES = ['CANCELADA', 'ANULADA', 'FINALIZADA'];
const ASIGNACIONES_QUE_NO_CUENTAN = ['REEMPLAZADO', 'AUSENTE'];

function fechaLocal(fecha: string, hora: string): Date {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
  const [hh, mm, ss] = hora.split(':').map((x) => Number(x) || 0);
  return new Date(anio, mes - 1, dia, hh, mm, ss ?? 0);
}

/**
 * Una guardia esta vigente si `ahora` cae entre su inicio y su fin. Si la hora
 * de fin es igual o menor a la de inicio (turno nocturno), termina al dia siguiente.
 */
export function guardiaVigente(
  g: { fecha: string; horaInicio: string; horaFin: string; estado: string },
  ahora: Date,
): boolean {
  if (ESTADOS_GUARDIA_NO_VIGENTES.includes(g.estado)) return false;
  const inicio = fechaLocal(g.fecha, g.horaInicio);
  const fin = fechaLocal(g.fecha, g.horaFin);
  if (fin.getTime() <= inicio.getTime()) fin.setDate(fin.getDate() + 1);
  return ahora.getTime() >= inicio.getTime() && ahora.getTime() < fin.getTime();
}

const aIsoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** 2.3 Disponibilidad en vivo: que se puede mandar ahora mismo. */
@Injectable()
export class DisponibilidadService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async consultar(ahora: Date = new Date()) {
    const [moviles, personal, convocatorias] = await Promise.all([
      this.moviles(),
      this.personalDeGuardia(ahora),
      this.convocatoriasAbiertas(),
    ]);
    return { generadoEn: ahora, moviles, personalDeGuardia: personal, convocatorias };
  }

  private async moviles() {
    const todos = (await this.dataSource.getRepository(Vehiculo).find({})).filter((v) => v.estado !== 'BAJA');
    const resumen = (v: Vehiculo) => ({ id: v.id, numeroInterno: v.numeroInterno, alias: v.alias, tipo: v.tipo });
    return {
      total: todos.length,
      disponibles: todos.filter((v) => v.estado === 'OPERATIVO' && v.estadoOperativo === 'EN_CUARTEL').map(resumen),
      enServicio: todos
        .filter((v) => v.estado === 'OPERATIVO' && v.estadoOperativo !== 'EN_CUARTEL')
        .map((v) => ({ ...resumen(v), estadoOperativo: v.estadoOperativo })),
      noOperativos: todos.filter((v) => v.estado !== 'OPERATIVO').map((v) => ({ ...resumen(v), estado: v.estado })),
    };
  }

  private async personalDeGuardia(ahora: Date) {
    const hoy = new Date(ahora);
    const ayer = new Date(ahora);
    ayer.setDate(ayer.getDate() - 1);
    const guardias = await this.dataSource
      .getRepository(Guardia)
      .find({ where: [{ fecha: aIsoLocal(hoy) }, { fecha: aIsoLocal(ayer) }] });
    const vigentes = guardias.filter((g) => guardiaVigente(g, ahora));

    const filas: Array<{
      guardiaId: string;
      bomberoId: string;
      nombre: string;
      numeroBombero: string | null;
      rol: string | null;
      tipoParticipacion: string;
      ausente: boolean;
    }> = [];
    const aprobadas = (await this.dataSource.getRepository(Ausencia).find({ where: { estado: 'APROBADA' } })).filter((a) => a.desde <= aIsoLocal(hoy) && aIsoLocal(hoy) <= a.hasta);
    const ausentes = new Set(aprobadas.map((a) => a.bomberoId));
    const asignacionesRepo = this.dataSource.getRepository(AsignacionGuardia);
    const bomberosRepo = this.dataSource.getRepository(Bombero);
    for (const g of vigentes) {
      const asignaciones = (await asignacionesRepo.find({ where: { guardiaId: g.id } })).filter(
        (a) => !ASIGNACIONES_QUE_NO_CUENTAN.includes(a.estado),
      );
      for (const a of asignaciones) {
        const b = await bomberosRepo.findOne({ where: { id: a.bomberoId } });
        filas.push({
          guardiaId: g.id,
          bomberoId: a.bomberoId,
          nombre: b ? `${b.apellido}, ${b.nombre}` : 'Sin ficha',
          numeroBombero: b?.numeroBombero ?? null,
          rol: a.rol,
          tipoParticipacion: a.tipoParticipacion,
          // Con una ausencia aprobada que cubre hoy no cuenta como disponible.
          ausente: ausentes.has(a.bomberoId),
        });
      }
    }
    return { guardiasVigentes: vigentes.length, personal: filas };
  }

  private async convocatoriasAbiertas() {
    const abiertas = await this.dataSource.getRepository(Convocatoria).find({ where: { estado: 'ABIERTA' }, order: { creadoEn: 'DESC' } });
    const respuestasRepo = this.dataSource.getRepository(ConvocatoriaRespuesta);
    const salida: Array<{ id: string; mensaje: string; voy: number; noPuedo: number; menorEtaMinutos: number | null }> = [];
    for (const c of abiertas) {
      const respuestas = await respuestasRepo.find({ where: { convocatoriaId: c.id } });
      const voy = respuestas.filter((r) => r.respuesta === 'VOY');
      const etas = voy.map((r) => r.etaMinutos).filter((e): e is number => typeof e === 'number');
      salida.push({
        id: c.id,
        mensaje: c.mensaje,
        voy: voy.length,
        noPuedo: respuestas.length - voy.length,
        menorEtaMinutos: etas.length ? Math.min(...etas) : null,
      });
    }
    return salida;
  }
}
