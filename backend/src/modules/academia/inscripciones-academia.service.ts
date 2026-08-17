import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  Bombero,
  HistorialInstitucional,
  InscripcionActividadAcademica,
  Parametro,
  ParticipanteExterno,
  Rango,
  SocioProtector,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { BeneficiosSociosService } from '../finanzas/beneficios-socios.service';
import { InscribirParticipanteDto } from './dto/inscribir-participante.dto';
import { ActualizarInscripcionDto } from './dto/actualizar-inscripcion.dto';

@Injectable()
export class InscripcionesAcademiaService {
  constructor(
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(InscripcionActividadAcademica) private readonly inscripcionRepo: Repository<InscripcionActividadAcademica>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    @InjectRepository(ParticipanteExterno) private readonly externoRepo: Repository<ParticipanteExterno>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(HistorialInstitucional) private readonly historialRepo: Repository<HistorialInstitucional>,
    @InjectRepository(SocioProtector) private readonly socioProtectorRepo: Repository<SocioProtector>,
    private readonly auditoriaService: AuditoriaService,
    private readonly beneficiosSociosService: BeneficiosSociosService,
  ) {}

  private async verificarActividad(actividadId: string) {
    const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${actividadId} no encontrada`);
    return actividad;
  }

  /** Resuelve nombre/rango/institucion de cada inscripto para no dejarle esa
   * tarea al frontend -- mismo criterio que listarInstructores. */
  async listarParticipantes(actividadId: string) {
    await this.verificarActividad(actividadId);
    const inscripciones = await this.inscripcionRepo.find({ where: { actividadId }, order: { creadoEn: 'ASC' } });
    if (inscripciones.length === 0) return [];

    const bomberoIds = inscripciones.filter((i) => i.bomberoId).map((i) => i.bomberoId as string);
    const externoIds = inscripciones.filter((i) => i.participanteExternoId).map((i) => i.participanteExternoId as string);
    const resultadoIds = [...new Set(inscripciones.map((i) => i.resultadoFinalId).filter((x): x is string => !!x))];

    const bomberos = bomberoIds.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
      : [];
    const rangoIds = [...new Set(bomberos.map((b) => b.rangoId).filter((x): x is string => !!x))];
    const rangos = rangoIds.length
      ? await this.rangoRepo.createQueryBuilder('r').where('r.id IN (:...ids)', { ids: rangoIds }).getMany()
      : [];
    const rangoPorId = new Map(rangos.map((r) => [r.id, r]));
    const bomberoPorId = new Map(bomberos.map((b) => [b.id, b]));

    const externos = externoIds.length
      ? await this.externoRepo.createQueryBuilder('x').where('x.id IN (:...ids)', { ids: externoIds }).getMany()
      : [];
    const externoPorId = new Map(externos.map((x) => [x.id, x]));

    const resultados = resultadoIds.length
      ? await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: resultadoIds }).getMany()
      : [];
    const resultadoPorId = new Map(resultados.map((r) => [r.id, r.nombre]));

    return inscripciones.map((i) => {
      if (i.bomberoId) {
        const b = bomberoPorId.get(i.bomberoId);
        return {
          id: i.id,
          tipo: 'PERSONAL' as const,
          bomberoId: i.bomberoId,
          numeroBombero: b?.numeroBombero ?? null,
          nombreCompleto: b ? `${b.nombre} ${b.apellido}` : '(bombero no encontrado)',
          rango: (b?.rangoId ? rangoPorId.get(b.rangoId)?.nombre : null) ?? b?.rango ?? null,
          fechaInscripcion: i.fechaInscripcion,
          estado: i.estado,
          resultadoFinalId: i.resultadoFinalId,
          resultadoFinal: i.resultadoFinalId ? (resultadoPorId.get(i.resultadoFinalId) ?? null) : null,
          observaciones: i.observaciones,
          costoBase: i.costoBase,
          beneficioAplicadoId: i.beneficioAplicadoId,
          descuentoImporte: i.descuentoImporte,
          costoFinal: i.costoFinal,
        };
      }
      const x = externoPorId.get(i.participanteExternoId as string);
      return {
        id: i.id,
        tipo: 'EXTERNO' as const,
        participanteExternoId: i.participanteExternoId,
        nombreCompleto: x ? `${x.nombre} ${x.apellido ?? ''}`.trim() : '(participante externo no encontrado)',
        institucionProcedencia: x?.institucionProcedencia ?? null,
        fechaInscripcion: i.fechaInscripcion,
        estado: i.estado,
        resultadoFinalId: i.resultadoFinalId,
        resultadoFinal: i.resultadoFinalId ? (resultadoPorId.get(i.resultadoFinalId) ?? null) : null,
        observaciones: i.observaciones,
      };
    });
  }

  async inscribir(actividadId: string, dto: InscribirParticipanteDto, actorId: string, ip?: string) {
    const actividad = await this.verificarActividad(actividadId);

    if (!dto.bomberoId && !dto.externo) {
      throw new BadRequestException('Debe indicar bomberoId o los datos de un participante externo');
    }
    if (dto.bomberoId && dto.externo) {
      throw new BadRequestException('No se puede indicar bomberoId y participante externo al mismo tiempo');
    }

    let bomberoId: string | null = null;
    let participanteExternoId: string | null = null;

    if (dto.bomberoId) {
      const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
      if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);
      bomberoId = dto.bomberoId;
    } else if (dto.externo) {
      const externo = await this.externoRepo.save(
        this.externoRepo.create({
          cedula: dto.externo.cedula ?? null,
          nombre: dto.externo.nombre,
          apellido: dto.externo.apellido ?? null,
          celular: dto.externo.celular ?? null,
          institucionProcedencia: dto.externo.institucionProcedencia ?? null,
          observacion: dto.externo.observacion ?? null,
          creadoPor: actorId,
        }),
      );
      participanteExternoId = externo.id;
    }

    const participanteId = bomberoId ?? participanteExternoId;
    const yaExiste = await this.inscripcionRepo.findOne({ where: { actividadId, participanteId: participanteId! } });
    if (yaExiste) {
      throw new BadRequestException('Esta persona ya esta inscrita en esta actividad');
    }

    // Descuento de Socio Protector (seccion 12 del pedido): solo si la
    // actividad tiene costo y el inscripto es un bombero vinculado a un
    // Socio Protector activo con un beneficio aplicable -- el costo base
    // de la actividad nunca se modifica, el calculo queda en la
    // inscripcion y auditado en AplicacionBeneficio.
    let costoBase: number | null = null;
    let beneficioAplicadoId: string | null = null;
    let descuentoImporte: number | null = null;
    let costoFinal: number | null = null;
    let socioParaBeneficio: SocioProtector | null = null;

    if (actividad.costo != null && bomberoId) {
      socioParaBeneficio = await this.socioProtectorRepo.findOne({ where: { bomberoId } });
      if (socioParaBeneficio) {
        const beneficio = await this.beneficiosSociosService.buscarAplicable(socioParaBeneficio.id, 'ACADEMIA', actividadId);
        costoBase = actividad.costo;
        if (beneficio) {
          const simulacion = await this.beneficiosSociosService.simular(socioParaBeneficio.id, 'ACADEMIA', actividad.costo, actividadId);
          descuentoImporte = simulacion.descuentoAplicado;
          costoFinal = simulacion.montoFinal;
          beneficioAplicadoId = beneficio.id;
        } else {
          costoFinal = actividad.costo;
        }
      }
    }

    const inscripcion = await this.inscripcionRepo.save(
      this.inscripcionRepo.create({
        actividadId,
        bomberoId,
        participanteExternoId,
        fechaInscripcion: new Date().toISOString().slice(0, 10),
        estado: 'INSCRITO',
        costoBase,
        beneficioAplicadoId,
        descuentoImporte,
        costoFinal,
        creadoPor: actorId,
      }),
    );

    if (beneficioAplicadoId && socioParaBeneficio) {
      const beneficio = await this.beneficiosSociosService.findOne(beneficioAplicadoId);
      await this.beneficiosSociosService.aplicar(beneficio, socioParaBeneficio.id, inscripcion.id, costoBase as number, actorId);
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'INSCRIBIR',
      recurso: 'academia.inscripciones',
      recursoId: inscripcion.id,
      datosDespues: inscripcion,
      ip: ip ?? null,
    });
    return inscripcion;
  }

  async actualizar(actividadId: string, inscripcionId: string, dto: ActualizarInscripcionDto, actorId: string, ip?: string) {
    const anterior = await this.inscripcionRepo.findOne({ where: { id: inscripcionId, actividadId } });
    if (!anterior) throw new NotFoundException(`Inscripcion ${inscripcionId} no encontrada en esta actividad`);

    await this.inscripcionRepo.update(inscripcionId, {
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      ...(dto.resultadoFinalId !== undefined ? { resultadoFinalId: dto.resultadoFinalId } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      actualizadoPor: actorId,
    });

    const actualizado = await this.inscripcionRepo.findOne({ where: { id: inscripcionId } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ACTUALIZAR_INSCRIPCION',
      recurso: 'academia.inscripciones',
      recursoId: inscripcionId,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });

    // Deja un asiento en el historial institucional del bombero al
    // completar la actividad -- solo la primera vez que pasa a FINALIZADO,
    // y solo para personal interno (un participante externo no tiene ficha
    // de Personal). Seccion 16 del pedido.
    if (actualizado && anterior.estado !== 'FINALIZADO' && actualizado.estado === 'FINALIZADO' && actualizado.bomberoId) {
      const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
      await this.historialRepo.save(
        this.historialRepo.create({
          bomberoId: actualizado.bomberoId,
          tipoMovimiento: 'FORMACION_ACADEMICA',
          fecha: new Date().toISOString().slice(0, 10),
          usuarioResponsableId: actorId,
          motivo: actividad ? `Finalizacion de actividad academica: ${actividad.nombre}` : 'Finalizacion de actividad academica',
          referenciaTabla: 'academia.actividades',
          referenciaId: actividadId,
        }),
      );
    }

    return actualizado;
  }

  async quitar(actividadId: string, inscripcionId: string, actorId: string, ip?: string) {
    const inscripcion = await this.inscripcionRepo.findOne({ where: { id: inscripcionId, actividadId } });
    if (!inscripcion) throw new NotFoundException(`Inscripcion ${inscripcionId} no encontrada en esta actividad`);

    await this.inscripcionRepo.delete(inscripcionId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'QUITAR_INSCRIPCION',
      recurso: 'academia.inscripciones',
      recursoId: inscripcionId,
      datosAntes: inscripcion,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
