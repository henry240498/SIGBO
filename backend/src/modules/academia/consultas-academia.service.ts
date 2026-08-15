import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  Bombero,
  Certificacion,
  InscripcionActividadAcademica,
  Parametro,
} from '../../shared/entities';

/**
 * Capa de consulta de SOLO LECTURA sobre el modelo de Academia -- preparada
 * para que la futura IA institucional (Snoopy) la consuma sin necesidad de
 * tocar entidades ni servicios internos (seccion 25 del pedido).
 *
 * Reglas que cualquier consumidor (incluida una IA) debe respetar:
 *  1. Ningun metodo de este servicio escribe nada -- son consultas puras.
 *  2. Los resultados reflejan exactamente lo que esta registrado en SIGBO;
 *     nunca se infiere ni se completa informacion faltante (ej. si un
 *     bombero no cargo su certificado, este servicio no asume que lo
 *     obtuvo solo porque participo de la actividad).
 *  3. El filtrado por permisos del usuario que consulta queda a cargo del
 *     controller (RequirePermission de cada endpoint) -- este servicio no
 *     decide autorizacion por si mismo.
 */
@Injectable()
export class ConsultasAcademiaService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(InscripcionActividadAcademica) private readonly inscripcionRepo: Repository<InscripcionActividadAcademica>,
    @InjectRepository(Certificacion) private readonly certificacionRepo: Repository<Certificacion>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  /** Perfil academico completo de un bombero: actividades cursadas (con
   * resultado) + certificaciones registradas. Es la fuente de verdad que
   * Snoopy debe citar si le preguntan "que formacion tiene fulano" -- nunca
   * debe responder eso de memoria/inferencia. */
  async formacionCompletaDeBombero(bomberoId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    const [inscripciones, certificaciones] = await Promise.all([
      this.inscripcionRepo.find({ where: { bomberoId } }),
      this.certificacionRepo.find({ where: { bomberoId }, order: { fechaObtencion: 'DESC' } }),
    ]);

    const actividadIds = [...new Set(inscripciones.map((i) => i.actividadId))];
    const actividades = actividadIds.length
      ? await this.actividadRepo.createQueryBuilder('a').where('a.id IN (:...ids)', { ids: actividadIds }).getMany()
      : [];
    const actividadPorId = new Map(actividades.map((a) => [a.id, a]));

    const resultadoIds = [...new Set(inscripciones.map((i) => i.resultadoFinalId).filter((x): x is string => !!x))];
    const resultados = resultadoIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: resultadoIds }).getMany()
      : [];
    const resultadoPorId = new Map(resultados.map((r) => [r.id, r.nombre]));

    return {
      bomberoId,
      nombreCompleto: `${bombero.nombre} ${bombero.apellido}`,
      numeroBombero: bombero.numeroBombero,
      actividadesAcademicas: inscripciones.map((i) => {
        const actividad = actividadPorId.get(i.actividadId);
        return {
          actividadId: i.actividadId,
          nombreActividad: actividad?.nombre ?? null,
          fechaInicio: actividad?.fechaInicio ?? null,
          fechaFin: actividad?.fechaFin ?? null,
          estadoInscripcion: i.estado,
          resultado: i.resultadoFinalId ? (resultadoPorId.get(i.resultadoFinalId) ?? null) : null,
        };
      }),
      certificaciones: certificaciones.map((c) => ({
        nombre: c.nombre,
        tipo: c.tipo,
        institucion: c.institucion,
        fechaObtencion: c.fechaObtencion,
        fechaVencimiento: c.fechaVencimiento,
        estado: c.estado,
        tieneArchivoAdjunto: !!c.archivoUrl,
        actividadAcademicaId: c.actividadAcademicaId,
      })),
    };
  }

  /** Actividades vigentes (abiertas o en curso) -- para responder "que
   * cursos hay disponibles/en marcha ahora" sin exponer datos de
   * participantes individuales. */
  async actividadesVigentes() {
    return this.actividadRepo
      .createQueryBuilder('a')
      .where('a.estado IN (:...estados)', { estados: ['ABIERTA', 'EN_CURSO'] })
      .orderBy('a.fechaInicio', 'ASC')
      .getMany();
  }

  /** Indicadores agregados del modulo -- ninguno identifica a una persona
   * individual, aptos para un resumen institucional general. */
  async resumenInstitucional() {
    const [totalActividades, actividadesPorEstado, totalInscripciones, inscripcionesPorEstado] = await Promise.all([
      this.actividadRepo.count(),
      this.actividadRepo
        .createQueryBuilder('a')
        .select('a.estado', 'estado')
        .addSelect('COUNT(*)', 'total')
        .groupBy('a.estado')
        .getRawMany<{ estado: string; total: string }>(),
      this.inscripcionRepo.count(),
      this.inscripcionRepo
        .createQueryBuilder('i')
        .select('i.estado', 'estado')
        .addSelect('COUNT(*)', 'total')
        .groupBy('i.estado')
        .getRawMany<{ estado: string; total: string }>(),
    ]);

    return {
      totalActividades,
      actividadesPorEstado: Object.fromEntries(actividadesPorEstado.map((r) => [r.estado, Number(r.total)])),
      totalInscripciones,
      inscripcionesPorEstado: Object.fromEntries(inscripcionesPorEstado.map((r) => [r.estado, Number(r.total)])),
    };
  }
}
