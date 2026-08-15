import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadAcademica, EventoAsistencia, InscripcionActividadAcademica } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { EventosAsistenciaService } from '../operaciones/eventos-asistencia.service';
import { CrearSesionAcademicaDto } from './dto/crear-sesion-academica.dto';

@Injectable()
export class SesionesAcademiaService {
  constructor(
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(EventoAsistencia) private readonly eventoRepo: Repository<EventoAsistencia>,
    @InjectRepository(InscripcionActividadAcademica) private readonly inscripcionRepo: Repository<InscripcionActividadAcademica>,
    private readonly eventosAsistenciaService: EventosAsistenciaService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async listarSesiones(actividadId: string) {
    const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${actividadId} no encontrada`);
    return this.eventoRepo.find({ where: { actividadAcademicaId: actividadId }, order: { fechaInicio: 'ASC' } });
  }

  async crearSesion(actividadId: string, dto: CrearSesionAcademicaDto, actorId: string, ip?: string) {
    const actividad = await this.actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${actividadId} no encontrada`);

    if (new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    const evento = await this.eventoRepo.save(
      this.eventoRepo.create({
        nombre: dto.nombre ?? actividad.nombre,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        ubicacion: dto.ubicacion ?? actividad.lugar ?? null,
        tipoEventoId: dto.tipoEventoId ?? null,
        estado: 'PROGRAMADO',
        actividadAcademicaId: actividadId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR_SESION',
      recurso: 'operaciones.eventos_asistencia',
      recursoId: evento.id,
      datosDespues: evento,
      ip: ip ?? null,
    });

    if (dto.inscribirParticipantesActuales !== false) {
      const inscripciones = await this.inscripcionRepo.find({ where: { actividadId } });
      for (const inscripcion of inscripciones) {
        try {
          if (inscripcion.bomberoId) {
            await this.eventosAsistenciaService.agregarParticipante(evento.id, { bomberoId: inscripcion.bomberoId }, actorId, ip);
          } else if (inscripcion.participanteExternoId) {
            // El participante externo ya existe (creado al inscribirse en la
            // actividad) -- ParticipanteEvento solo necesita la referencia,
            // no volver a crear el registro en participantes_externos.
            await this.eventosAsistenciaService.agregarParticipanteExistente(evento.id, {
              participanteExternoId: inscripcion.participanteExternoId,
            });
          }
        } catch {
          // Si ya es participante o el registro no se puede agregar, no
          // interrumpe la creacion de la sesion -- se puede agregar a mano.
        }
      }
    }

    return evento;
  }
}
