import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  Bombero,
  EvaluacionAcademica,
  InscripcionActividadAcademica,
  InstructorExterno,
  NotaEvaluacionAcademica,
  ParticipanteExterno,
  Parametro,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { RegistrarNotaDto } from './dto/registrar-nota.dto';

@Injectable()
export class EvaluacionesAcademiaService {
  constructor(
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(EvaluacionAcademica) private readonly evaluacionRepo: Repository<EvaluacionAcademica>,
    @InjectRepository(NotaEvaluacionAcademica) private readonly notaRepo: Repository<NotaEvaluacionAcademica>,
    @InjectRepository(InscripcionActividadAcademica) private readonly inscripcionRepo: Repository<InscripcionActividadAcademica>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(InstructorExterno) private readonly instructorExternoRepo: Repository<InstructorExterno>,
    @InjectRepository(ParticipanteExterno) private readonly participanteExternoRepo: Repository<ParticipanteExterno>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async listarEvaluaciones(actividadId: string) {
    const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${actividadId} no encontrada`);
    return this.evaluacionRepo.find({ where: { actividadId }, order: { fecha: 'ASC' } });
  }

  async crearEvaluacion(actividadId: string, dto: CrearEvaluacionDto, actorId: string, ip?: string) {
    const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${actividadId} no encontrada`);

    const evaluacion = await this.evaluacionRepo.save(
      this.evaluacionRepo.create({
        actividadId,
        tipoEvaluacionId: dto.tipoEvaluacionId,
        titulo: dto.titulo ?? null,
        fecha: dto.fecha ?? null,
        evaluadorBomberoId: dto.evaluadorBomberoId ?? null,
        evaluadorExternoId: dto.evaluadorExternoId ?? null,
        escala: dto.escala ?? null,
        observaciones: dto.observaciones ?? null,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR_EVALUACION',
      recurso: 'academia.evaluaciones',
      recursoId: evaluacion.id,
      datosDespues: evaluacion,
      ip: ip ?? null,
    });
    return evaluacion;
  }

  private async verificarEvaluacion(evaluacionId: string) {
    const evaluacion = await this.evaluacionRepo.findOne({ where: { id: evaluacionId } });
    if (!evaluacion) throw new NotFoundException(`Evaluacion ${evaluacionId} no encontrada`);
    return evaluacion;
  }

  /** Lista una fila por cada inscripto de la actividad (haya nota o no), para
   * que la pantalla de carga de notas no dependa de que el usuario sepa
   * quienes ya tienen nota cargada. */
  async listarNotas(evaluacionId: string) {
    const evaluacion = await this.verificarEvaluacion(evaluacionId);
    const inscripciones = await this.inscripcionRepo.find({ where: { actividadId: evaluacion.actividadId } });
    if (inscripciones.length === 0) return [];

    const notas = await this.notaRepo.find({ where: { evaluacionId } });
    const notaPorInscripcion = new Map(notas.map((n) => [n.inscripcionId, n]));

    const bomberoIds = inscripciones.filter((i) => i.bomberoId).map((i) => i.bomberoId as string);
    const externoIds = inscripciones.filter((i) => i.participanteExternoId).map((i) => i.participanteExternoId as string);
    const resultadoIds = [
      ...new Set(notas.map((n) => n.resultadoId).filter((x): x is string => !!x)),
    ];

    const bomberos = bomberoIds.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
      : [];
    const externos = externoIds.length
      ? await this.participanteExternoRepo.createQueryBuilder('x').where('x.id IN (:...ids)', { ids: externoIds }).getMany()
      : [];
    const resultados = resultadoIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: resultadoIds }).getMany()
      : [];
    const bomberoPorId = new Map(bomberos.map((b) => [b.id, b]));
    const externoPorId = new Map(externos.map((x) => [x.id, x]));
    const resultadoPorId = new Map(resultados.map((r) => [r.id, r.nombre]));

    return inscripciones.map((i) => {
      const nota = notaPorInscripcion.get(i.id);
      const bombero = i.bomberoId ? bomberoPorId.get(i.bomberoId) : undefined;
      const externo = i.participanteExternoId ? externoPorId.get(i.participanteExternoId) : undefined;
      return {
        inscripcionId: i.id,
        notaId: nota?.id ?? null,
        nombreCompleto: bombero ? `${bombero.nombre} ${bombero.apellido}` : externo ? `${externo.nombre} ${externo.apellido ?? ''}`.trim() : '(desconocido)',
        numeroBombero: bombero?.numeroBombero ?? null,
        calificacion: nota?.calificacion ?? null,
        resultadoId: nota?.resultadoId ?? null,
        resultado: nota?.resultadoId ? (resultadoPorId.get(nota.resultadoId) ?? null) : null,
        observaciones: nota?.observaciones ?? null,
      };
    });
  }

  /** Upsert: crea la nota si no existe, la actualiza si ya existe -- una
   * inscripcion tiene a lo sumo una nota por evaluacion. */
  async registrarNota(evaluacionId: string, inscripcionId: string, dto: RegistrarNotaDto, actorId: string, ip?: string) {
    const evaluacion = await this.verificarEvaluacion(evaluacionId);
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id: inscripcionId, actividadId: evaluacion.actividadId } });
    if (!inscripcion) throw new NotFoundException(`Inscripcion ${inscripcionId} no encontrada en esta actividad`);

    const existente = await this.notaRepo.findOne({ where: { evaluacionId, inscripcionId } });

    if (existente) {
      const anterior = { ...existente };
      await this.notaRepo.update(existente.id, {
        ...(dto.calificacion !== undefined ? { calificacion: dto.calificacion } : {}),
        ...(dto.resultadoId !== undefined ? { resultadoId: dto.resultadoId } : {}),
        ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      });
      const actualizada = await this.notaRepo.findOne({ where: { id: existente.id } });
      await this.auditoriaService.registrar({
        usuarioId: actorId,
        accion: 'ACTUALIZAR_NOTA',
        recurso: 'academia.notas_evaluacion',
        recursoId: existente.id,
        datosAntes: anterior,
        datosDespues: actualizada,
        ip: ip ?? null,
      });
      return actualizada;
    }

    const nota = await this.notaRepo.save(
      this.notaRepo.create({
        evaluacionId,
        inscripcionId,
        calificacion: dto.calificacion ?? null,
        resultadoId: dto.resultadoId ?? null,
        observaciones: dto.observaciones ?? null,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGISTRAR_NOTA',
      recurso: 'academia.notas_evaluacion',
      recursoId: nota.id,
      datosDespues: nota,
      ip: ip ?? null,
    });
    return nota;
  }
}
