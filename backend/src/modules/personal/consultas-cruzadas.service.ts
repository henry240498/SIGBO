import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  AsignacionGuardia,
  Guardia,
  InscripcionActividadAcademica,
  Parametro,
  PersonalServicio,
  Servicio,
  TipoServicio,
} from '../../shared/entities';

@Injectable()
export class ConsultasCruzadasService {
  constructor(
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia)
    private readonly asignacionGuardiaRepo: Repository<AsignacionGuardia>,
    @InjectRepository(TipoServicio) private readonly tipoServicioRepo: Repository<TipoServicio>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(PersonalServicio)
    private readonly personalServicioRepo: Repository<PersonalServicio>,
    @InjectRepository(ActividadAcademica) private readonly actividadAcademicaRepo: Repository<ActividadAcademica>,
    @InjectRepository(InscripcionActividadAcademica)
    private readonly inscripcionActividadRepo: Repository<InscripcionActividadAcademica>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  async guardiasDeBombero(bomberoId: string) {
    const asignaciones = await this.asignacionGuardiaRepo.find({ where: { bomberoId } });
    if (asignaciones.length === 0) return [];

    const guardiaIds = [...new Set(asignaciones.map((a) => a.guardiaId))];
    const guardias = await this.guardiaRepo
      .createQueryBuilder('g')
      .where('g.id IN (:...ids)', { ids: guardiaIds })
      .getMany();
    const guardiaMap = new Map(guardias.map((g) => [g.id, g]));

    return asignaciones
      .map((asignacion) => ({ asignacion, guardia: guardiaMap.get(asignacion.guardiaId) }))
      .sort((x, y) => compararDesc(x.guardia?.fecha, y.guardia?.fecha))
      .map(({ asignacion, guardia }) => ({
        asignacionId: asignacion.id,
        guardiaId: asignacion.guardiaId,
        fecha: guardia?.fecha ?? null,
        turno: guardia?.turno ?? null,
        horaInicio: guardia?.horaInicio ?? null,
        horaFin: guardia?.horaFin ?? null,
        rol: asignacion.rol,
        estado: asignacion.estado,
      }));
  }

  async serviciosDeBombero(bomberoId: string) {
    const participaciones = await this.personalServicioRepo.find({ where: { bomberoId } });
    if (participaciones.length === 0) return [];

    const servicioIds = [...new Set(participaciones.map((p) => p.servicioId))];
    const servicios = await this.servicioRepo
      .createQueryBuilder('s')
      .where('s.id IN (:...ids)', { ids: servicioIds })
      .getMany();
    const servicioMap = new Map(servicios.map((s) => [s.id, s]));

    const tipoServicioIds = [...new Set(servicios.map((s) => s.tipoServicioId))];
    const tiposServicio = tipoServicioIds.length
      ? await this.tipoServicioRepo
          .createQueryBuilder('t')
          .where('t.id IN (:...ids)', { ids: tipoServicioIds })
          .getMany()
      : [];
    const tipoServicioMap = new Map(tiposServicio.map((t) => [t.id, t]));

    return participaciones
      .map((participacion) => ({ participacion, servicio: servicioMap.get(participacion.servicioId) }))
      .sort((x, y) => compararDesc(x.servicio?.fechaHoraAviso, y.servicio?.fechaHoraAviso))
      .map(({ participacion, servicio }) => ({
        participacionId: participacion.id,
        servicioId: participacion.servicioId,
        numeroServicio: servicio?.numeroServicio ?? null,
        fechaHoraAviso: servicio?.fechaHoraAviso ?? null,
        rol: participacion.rol,
        horasServicio: participacion.horasServicio,
        nombreTipoServicio: servicio ? (tipoServicioMap.get(servicio.tipoServicioId)?.nombre ?? null) : null,
      }));
  }

  async formacionAcademicaDeBombero(bomberoId: string) {
    const inscripciones = await this.inscripcionActividadRepo.find({ where: { bomberoId } });
    if (inscripciones.length === 0) return [];

    const actividadIds = [...new Set(inscripciones.map((i) => i.actividadId))];
    const actividades = await this.actividadAcademicaRepo
      .createQueryBuilder('a')
      .where('a.id IN (:...ids)', { ids: actividadIds })
      .getMany();
    const actividadMap = new Map(actividades.map((a) => [a.id, a]));

    const resultadoIds = [...new Set(inscripciones.map((i) => i.resultadoFinalId).filter((x): x is string => !!x))];
    const resultados = resultadoIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: resultadoIds }).getMany()
      : [];
    const resultadoMap = new Map(resultados.map((r) => [r.id, r.nombre]));

    return inscripciones
      .sort((x, y) => compararDesc(x.fechaInscripcion, y.fechaInscripcion))
      .map((inscripcion) => {
        const actividad = actividadMap.get(inscripcion.actividadId);
        return {
          inscripcionId: inscripcion.id,
          actividadId: inscripcion.actividadId,
          nombreActividad: actividad?.nombre ?? null,
          fechaInicio: actividad?.fechaInicio ?? null,
          fechaFin: actividad?.fechaFin ?? null,
          estado: inscripcion.estado,
          resultadoFinal: inscripcion.resultadoFinalId ? (resultadoMap.get(inscripcion.resultadoFinalId) ?? null) : null,
        };
      });
  }
}

/** Compara dos valores de fecha (string 'YYYY-MM-DD', Date, o null/undefined)
 * en orden descendente; los valores ausentes se ubican al final. */
function compararDesc(a: string | Date | null | undefined, b: string | Date | null | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const ta = a instanceof Date ? a.getTime() : new Date(a).getTime();
  const tb = b instanceof Date ? b.getTime() : new Date(b).getTime();
  return tb - ta;
}
