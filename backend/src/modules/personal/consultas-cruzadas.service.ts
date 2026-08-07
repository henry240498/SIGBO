import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AsignacionGuardia,
  Curso,
  Guardia,
  InscripcionCurso,
  Materia,
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
    @InjectRepository(Materia) private readonly materiaRepo: Repository<Materia>,
    @InjectRepository(Curso) private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(InscripcionCurso)
    private readonly inscripcionCursoRepo: Repository<InscripcionCurso>,
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
    const inscripciones = await this.inscripcionCursoRepo.find({ where: { bomberoId } });
    if (inscripciones.length === 0) return [];

    const cursoIds = [...new Set(inscripciones.map((i) => i.cursoId))];
    const cursos = await this.cursoRepo
      .createQueryBuilder('c')
      .where('c.id IN (:...ids)', { ids: cursoIds })
      .getMany();
    const cursoMap = new Map(cursos.map((c) => [c.id, c]));

    return inscripciones
      .sort((x, y) => compararDesc(x.fechaInscripcion, y.fechaInscripcion))
      .map((inscripcion) => {
        const curso = cursoMap.get(inscripcion.cursoId);
        return {
          inscripcionId: inscripcion.id,
          cursoId: inscripcion.cursoId,
          nombreCurso: curso?.nombre ?? null,
          fechaInicio: curso?.fechaInicio ?? null,
          fechaFin: curso?.fechaFin ?? null,
          estado: inscripcion.estado,
          notaFinal: inscripcion.notaFinal,
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
