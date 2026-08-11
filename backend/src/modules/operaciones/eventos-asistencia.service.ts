import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Bombero,
  EventoAsistencia,
  MarcacionAsistencia,
  ParticipanteEvento,
  ParticipanteExterno,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateEventoAsistenciaDto } from './dto/create-evento-asistencia.dto';
import { UpdateEventoAsistenciaDto } from './dto/update-evento-asistencia.dto';
import { AgregarParticipanteDto } from './dto/agregar-participante.dto';
import { ActualizarParticipacionDto } from './dto/actualizar-participacion.dto';

@Injectable()
export class EventosAsistenciaService {
  constructor(
    @InjectRepository(EventoAsistencia) private readonly eventoRepo: Repository<EventoAsistencia>,
    @InjectRepository(ParticipanteEvento) private readonly participanteRepo: Repository<ParticipanteEvento>,
    @InjectRepository(ParticipanteExterno) private readonly externoRepo: Repository<ParticipanteExterno>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(MarcacionAsistencia) private readonly marcacionRepo: Repository<MarcacionAsistencia>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(tipoEventoId?: string, estado?: string, desde?: string, hasta?: string) {
    const query = this.eventoRepo.createQueryBuilder('e').orderBy('e.fechaInicio', 'DESC');
    if (tipoEventoId) query.andWhere('e.tipoEventoId = :tipoEventoId', { tipoEventoId });
    if (estado) query.andWhere('e.estado = :estado', { estado });
    if (desde) query.andWhere('e.fechaFin >= :desde', { desde });
    if (hasta) query.andWhere('e.fechaInicio <= :hasta', { hasta });
    return query.getMany();
  }

  async findOne(id: string) {
    const evento = await this.eventoRepo.findOne({ where: { id } });
    if (!evento) throw new NotFoundException(`Evento ${id} no encontrado`);
    return evento;
  }

  async create(dto: CreateEventoAsistenciaDto, actorId: string, ip?: string) {
    if (new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    const evento = await this.eventoRepo.save(
      this.eventoRepo.create({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        ubicacion: dto.ubicacion ?? null,
        responsableId: dto.responsableId ?? null,
        tipoEventoId: dto.tipoEventoId ?? null,
        estado: (dto.estado as any) ?? 'PROGRAMADO',
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.eventos_asistencia',
      recursoId: evento.id,
      datosDespues: evento,
      ip: ip ?? null,
    });
    return evento;
  }

  async update(id: string, dto: UpdateEventoAsistenciaDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);
    await this.eventoRepo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.fechaInicio !== undefined ? { fechaInicio: new Date(dto.fechaInicio) } : {}),
      ...(dto.fechaFin !== undefined ? { fechaFin: new Date(dto.fechaFin) } : {}),
      ...(dto.ubicacion !== undefined ? { ubicacion: dto.ubicacion } : {}),
      ...(dto.responsableId !== undefined ? { responsableId: dto.responsableId } : {}),
      ...(dto.tipoEventoId !== undefined ? { tipoEventoId: dto.tipoEventoId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
    });
    const actualizado = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ACTUALIZAR',
      recurso: 'operaciones.eventos_asistencia',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  async listarParticipantes(eventoId: string) {
    await this.findOne(eventoId);
    const participantes = await this.participanteRepo.find({ where: { eventoId }, order: { creadoEn: 'ASC' } });
    if (participantes.length === 0) return [];

    const bomberoIds = participantes.filter((p) => p.bomberoId).map((p) => p.bomberoId as string);
    const externoIds = participantes.filter((p) => p.participanteExternoId).map((p) => p.participanteExternoId as string);

    const [bomberos, externos] = await Promise.all([
      bomberoIds.length
        ? this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
        : Promise.resolve([]),
      externoIds.length
        ? this.externoRepo.createQueryBuilder('x').where('x.id IN (:...ids)', { ids: externoIds }).getMany()
        : Promise.resolve([]),
    ]);
    const mapaBomberos = new Map(bomberos.map((b) => [b.id, b]));
    const mapaExternos = new Map(externos.map((x) => [x.id, x]));

    return participantes.map((p) => {
      const bombero = p.bomberoId ? mapaBomberos.get(p.bomberoId) : undefined;
      const externo = p.participanteExternoId ? mapaExternos.get(p.participanteExternoId) : undefined;
      return {
        ...p,
        tipoParticipante: bombero ? 'PERSONAL' : 'EXTERNO',
        nombreCompleto: bombero
          ? `${bombero.nombre} ${bombero.apellido}`
          : externo
            ? `${externo.nombre} ${externo.apellido ?? ''}`.trim()
            : '(desconocido)',
        codigoBombero: bombero?.numeroBombero ?? null,
      };
    });
  }

  async agregarParticipante(eventoId: string, dto: AgregarParticipanteDto, actorId: string, ip?: string) {
    await this.findOne(eventoId);

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
    const yaExiste = await this.participanteRepo.findOne({ where: { eventoId, participanteId: participanteId! } });
    if (yaExiste) {
      throw new BadRequestException('Esta persona ya es participante de este evento');
    }

    const participante = await this.participanteRepo.save(
      this.participanteRepo.create({
        eventoId,
        bomberoId,
        participanteExternoId,
        estadoParticipacion: 'NO_REGISTRADA',
        fuente: 'MANUAL',
        registradoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'AGREGAR_PARTICIPANTE',
      recurso: 'operaciones.participantes_evento',
      recursoId: participante.id,
      datosDespues: participante,
      ip: ip ?? null,
    });

    return participante;
  }

  async actualizarParticipacion(
    eventoId: string,
    participanteEventoId: string,
    dto: ActualizarParticipacionDto,
    actorId: string,
    ip?: string,
  ) {
    const participante = await this.participanteRepo.findOne({ where: { id: participanteEventoId, eventoId } });
    if (!participante) throw new NotFoundException(`Participante ${participanteEventoId} no encontrado en este evento`);

    await this.participanteRepo.update(participanteEventoId, {
      ...(dto.horaRealInicio !== undefined ? { horaRealInicio: new Date(dto.horaRealInicio) } : {}),
      ...(dto.horaRealFin !== undefined ? { horaRealFin: new Date(dto.horaRealFin) } : {}),
      ...(dto.porcentajeParticipacion !== undefined ? { porcentajeParticipacion: dto.porcentajeParticipacion } : {}),
      ...(dto.estadoParticipacion !== undefined ? { estadoParticipacion: dto.estadoParticipacion as any } : {}),
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
      fuente: 'MANUAL',
      registradoPor: actorId,
    });

    const actualizado = await this.participanteRepo.findOne({ where: { id: participanteEventoId } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ACTUALIZAR_PARTICIPACION',
      recurso: 'operaciones.participantes_evento',
      recursoId: participanteEventoId,
      datosAntes: participante,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  async quitarParticipante(eventoId: string, participanteEventoId: string, actorId: string, ip?: string) {
    const participante = await this.participanteRepo.findOne({ where: { id: participanteEventoId, eventoId } });
    if (!participante) throw new NotFoundException(`Participante ${participanteEventoId} no encontrado en este evento`);
    await this.participanteRepo.delete(participanteEventoId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'QUITAR_PARTICIPANTE',
      recurso: 'operaciones.participantes_evento',
      recursoId: participanteEventoId,
      datosAntes: participante,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }

  /**
   * Calcula (sin guardar) la relacion entre las marcaciones de entrada/salida
   * de un bombero y la ventana horaria del evento -- secciones 2-3 del
   * pedido: presencia en cuartel, participacion en el evento, y si fue
   * COMPLETA o PARCIAL. Nunca concluye AUSENTE_CONFIRMADO por si sola (eso
   * requiere confirmacion manual explicita, seccion 17).
   */
  async calcularSolapamientoMarcaciones(eventoId: string, bomberoId: string) {
    const evento = await this.findOne(eventoId);
    const marcaciones = await this.marcacionRepo.find({
      where: { bomberoId },
      order: { timestampMarcacion: 'ASC' },
    });

    const inicioEvento = evento.fechaInicio.getTime();
    const finEvento = evento.fechaFin.getTime();

    const relevantes = marcaciones.filter((m) => {
      const t = m.timestampMarcacion.getTime();
      return t <= finEvento && t >= inicioEvento - 12 * 60 * 60 * 1000;
    });

    const entrada = relevantes.find((m) => m.tipoMarcacion === 'ENTRADA');
    const salida = [...relevantes].reverse().find((m) => m.tipoMarcacion === 'SALIDA');

    if (!entrada) {
      return {
        presenciaInicio: null,
        presenciaFin: null,
        participacionInicio: null,
        participacionFin: null,
        duracionParticipacionMinutos: null,
        porcentajeParticipacion: null,
        estadoSugerido: 'NO_REGISTRADA',
      };
    }

    const presenciaInicio = entrada.timestampMarcacion;
    const presenciaFin = salida?.timestampMarcacion ?? null;

    const participacionInicioMs = Math.max(presenciaInicio.getTime(), inicioEvento);
    const participacionFinMs = presenciaFin ? Math.min(presenciaFin.getTime(), finEvento) : null;

    let duracionParticipacionMinutos: number | null = null;
    let porcentajeParticipacion: number | null = null;
    let estadoSugerido = 'PARCIAL';

    if (participacionFinMs !== null && participacionFinMs > participacionInicioMs) {
      duracionParticipacionMinutos = Math.round((participacionFinMs - participacionInicioMs) / 60000);
      const duracionEventoMinutos = Math.round((finEvento - inicioEvento) / 60000);
      porcentajeParticipacion = duracionEventoMinutos > 0
        ? Math.min(100, Math.round((duracionParticipacionMinutos / duracionEventoMinutos) * 10000) / 100)
        : null;

      const cubrioInicio = presenciaInicio.getTime() <= inicioEvento;
      const cubrioFin = presenciaFin !== null && presenciaFin.getTime() >= finEvento;
      estadoSugerido = cubrioInicio && cubrioFin ? 'COMPLETA' : 'PARCIAL';
    } else if (participacionFinMs === null && participacionInicioMs < finEvento) {
      estadoSugerido = 'PARCIAL';
    }

    return {
      presenciaInicio,
      presenciaFin,
      participacionInicio: new Date(participacionInicioMs),
      participacionFin: participacionFinMs !== null ? new Date(participacionFinMs) : null,
      duracionParticipacionMinutos,
      porcentajeParticipacion,
      estadoSugerido,
    };
  }

  async calcularYAplicarParticipacion(
    eventoId: string,
    participanteEventoId: string,
    actorId: string,
    ip?: string,
  ) {
    const participante = await this.participanteRepo.findOne({ where: { id: participanteEventoId, eventoId } });
    if (!participante) throw new NotFoundException(`Participante ${participanteEventoId} no encontrado en este evento`);
    if (!participante.bomberoId) {
      throw new BadRequestException('El calculo por marcaciones solo aplica a participantes que son personal (bomberos)');
    }

    const calculo = await this.calcularSolapamientoMarcaciones(eventoId, participante.bomberoId);
    const anterior = { ...participante };

    await this.participanteRepo.update(participanteEventoId, {
      horaRealInicio: calculo.participacionInicio,
      horaRealFin: calculo.participacionFin,
      porcentajeParticipacion: calculo.porcentajeParticipacion,
      estadoParticipacion: calculo.estadoSugerido as any,
      fuente: 'MARCADOR_DIGITAL',
      registradoPor: actorId,
    });

    const actualizado = await this.participanteRepo.findOne({ where: { id: participanteEventoId } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CALCULAR_PARTICIPACION_DESDE_MARCACIONES',
      recurso: 'operaciones.participantes_evento',
      recursoId: participanteEventoId,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }
}
