import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionGuardia, Bombero, Guardia, GrupoGuardiaMiembro, MarcacionAsistencia } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ElegibilidadService } from './elegibilidad.service';
import { OrdenGuardiaConfiguracionService } from './orden-guardia-configuracion.service';
import { CreateGuardiaDto } from './dto/create-guardia.dto';
import { UpdateGuardiaDto } from './dto/update-guardia.dto';
import { AsignarPersonalDto } from './dto/asignar-personal.dto';
import { RegistrarHorarioDto } from './dto/registrar-horario.dto';
import { ActualizarPresenciaDto } from './dto/actualizar-presencia.dto';
import { ReemplazarAsignacionDto } from './dto/reemplazar-asignacion.dto';

function normalizarHora(hora: string): string {
  return hora.length === 5 ? `${hora}:00` : hora;
}

@Injectable()
export class GuardiasService {
  constructor(
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionRepo: Repository<AsignacionGuardia>,
    @InjectRepository(GrupoGuardiaMiembro) private readonly miembroRepo: Repository<GrupoGuardiaMiembro>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(MarcacionAsistencia) private readonly marcacionRepo: Repository<MarcacionAsistencia>,
    private readonly auditoriaService: AuditoriaService,
    private readonly elegibilidadService: ElegibilidadService,
    private readonly configuracionOrdenService: OrdenGuardiaConfiguracionService,
  ) {}

  findAll(desde?: string, hasta?: string) {
    const query = this.guardiaRepo.createQueryBuilder('g').orderBy('g.fecha', 'DESC');
    if (desde) query.andWhere('g.fecha >= :desde', { desde });
    if (hasta) query.andWhere('g.fecha <= :hasta', { hasta });
    return query.getMany();
  }

  async findOne(id: string) {
    const guardia = await this.guardiaRepo.findOne({ where: { id } });
    if (!guardia) throw new NotFoundException(`Guardia ${id} no encontrada`);
    return guardia;
  }

  /** Rango real fecha+hora de la guardia, resolviendo el cruce de
   * medianoche (turno NOCTURNO tipico 19:00-07:00 del dia siguiente). */
  rangoGuardia(guardia: Guardia): { inicio: Date; fin: Date } {
    const inicio = new Date(`${guardia.fecha}T${normalizarHora(guardia.horaInicio)}-04:00`);
    let fin = new Date(`${guardia.fecha}T${normalizarHora(guardia.horaFin)}-04:00`);
    if (fin.getTime() <= inicio.getTime()) {
      fin = new Date(fin.getTime() + 24 * 60 * 60 * 1000);
    }
    return { inicio, fin };
  }

  async create(dto: CreateGuardiaDto, actorId: string, ip?: string) {
    const guardia = await this.guardiaRepo.save(
      this.guardiaRepo.create({
        fecha: dto.fecha,
        turno: dto.turno as any,
        horaInicio: normalizarHora(dto.horaInicio),
        horaFin: normalizarHora(dto.horaFin),
        tipo: (dto.tipo as any) ?? 'ORDINARIA',
        jefeGuardiaId: dto.jefeGuardiaId ?? null,
        grupoGuardiaId: dto.grupoGuardiaId ?? null,
        observaciones: dto.observaciones ?? null,
        esquemaHorarioId: dto.esquemaHorarioId ?? null,
        feriadoId: dto.feriadoId ?? null,
      }),
    );

    if (dto.grupoGuardiaId) {
      const miembros = await this.miembroRepo.find({ where: { grupoId: dto.grupoGuardiaId } });
      for (const m of miembros) {
        await this.asignacionRepo.save(
          this.asignacionRepo.create({
            guardiaId: guardia.id,
            bomberoId: m.bomberoId,
            rol: m.rol,
            estado: 'ASIGNADO',
            tipoParticipacion: 'TITULAR',
            fechaAsignacion: new Date(),
            asignadoPor: actorId,
          }),
        );
      }
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.guardias',
      recursoId: guardia.id,
      datosDespues: guardia,
      ip: ip ?? null,
    });
    return guardia;
  }

  /** Edicion manual de la guardia (seccion 22 del pedido): la automatizacion
   * nunca debe bloquear al responsable de la planificacion. */
  async update(id: string, dto: UpdateGuardiaDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);
    await this.guardiaRepo.update(id, {
      ...(dto.fecha !== undefined ? { fecha: dto.fecha } : {}),
      ...(dto.turno !== undefined ? { turno: dto.turno as any } : {}),
      ...(dto.horaInicio !== undefined ? { horaInicio: normalizarHora(dto.horaInicio) } : {}),
      ...(dto.horaFin !== undefined ? { horaFin: normalizarHora(dto.horaFin) } : {}),
      ...(dto.tipo !== undefined ? { tipo: dto.tipo as any } : {}),
      ...(dto.jefeGuardiaId !== undefined ? { jefeGuardiaId: dto.jefeGuardiaId } : {}),
      ...(dto.grupoGuardiaId !== undefined ? { grupoGuardiaId: dto.grupoGuardiaId } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      ...(dto.esquemaHorarioId !== undefined ? { esquemaHorarioId: dto.esquemaHorarioId } : {}),
      ...(dto.feriadoId !== undefined ? { feriadoId: dto.feriadoId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
    });
    const actualizada = await this.findOne(id);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'operaciones.guardias',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }

  /** Anulacion no destructiva (secciones 23/47): nunca se borra la fila,
   * solo se marca ANULADA con motivo, preservando trazabilidad completa. */
  async anular(id: string, motivo: string, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);
    if (anterior.estado === 'ANULADA') {
      throw new BadRequestException('Esta guardia ya esta anulada');
    }
    await this.guardiaRepo.update(id, {
      estado: 'ANULADA',
      observaciones: anterior.observaciones ? `${anterior.observaciones}\n[ANULADA] ${motivo}` : `[ANULADA] ${motivo}`,
    });
    const actualizada = await this.findOne(id);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR',
      recurso: 'operaciones.guardias',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }

  async listarAsignaciones(guardiaId: string) {
    await this.findOne(guardiaId);
    const asignaciones = await this.asignacionRepo.find({ where: { guardiaId } });
    if (asignaciones.length === 0) return [];
    const bomberoIds = [...new Set(asignaciones.map((a) => a.bomberoId))];
    const bomberos = await this.bomberoRepo
      .createQueryBuilder('b')
      .where('b.id IN (:...ids)', { ids: bomberoIds })
      .getMany();
    const mapa = new Map(bomberos.map((b) => [b.id, b]));
    return asignaciones.map((a) => ({
      ...a,
      nombreCompleto: mapa.get(a.bomberoId) ? `${mapa.get(a.bomberoId)!.nombre} ${mapa.get(a.bomberoId)!.apellido}` : '(desconocido)',
      codigoBombero: mapa.get(a.bomberoId)?.numeroBombero ?? null,
    }));
  }

  /** Historial de guardias de una persona (seccion 42 del pedido): siempre
   * por el id interno del bombero, nunca por el codigo bomberil. */
  async historialPersonal(bomberoId: string) {
    const asignaciones = await this.asignacionRepo.find({ where: { bomberoId }, order: { fechaAsignacion: 'DESC' } });
    if (asignaciones.length === 0) return [];
    const guardiaIds = [...new Set(asignaciones.map((a) => a.guardiaId))];
    const guardias = await this.guardiaRepo.createQueryBuilder('g').where('g.id IN (:...ids)', { ids: guardiaIds }).getMany();
    const guardiaPorId = new Map(guardias.map((g) => [g.id, g]));
    return asignaciones
      .map((a) => ({ ...a, guardia: guardiaPorId.get(a.guardiaId) ?? null }))
      .filter((a) => a.guardia !== null);
  }

  async asignarPersonal(guardiaId: string, dto: AsignarPersonalDto, actorId: string, ip?: string) {
    await this.findOne(guardiaId);
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);

    const tipoParticipacion = dto.tipoParticipacion ?? 'TITULAR';
    let rol = dto.rol ?? null;
    let reemplazaAsignacionId: string | null = null;
    let original: AsignacionGuardia | null = null;

    if (tipoParticipacion === 'REEMPLAZO') {
      if (!dto.reemplazaAsignacionId) {
        throw new BadRequestException('reemplazaAsignacionId es obligatorio cuando tipoParticipacion es REEMPLAZO');
      }
      original = await this.asignacionRepo.findOne({ where: { id: dto.reemplazaAsignacionId, guardiaId } });
      if (!original) throw new NotFoundException(`Asignacion ${dto.reemplazaAsignacionId} no encontrada en esta guardia`);
      reemplazaAsignacionId = original.id;
      rol = rol ?? original.rol;
    }

    if (original) {
      // Reemplazo: ademas de la elegibilidad absoluta del rol, aplica la
      // regla relativa al reemplazado (seccion 13 del pedido de Orden de
      // Guardia): oficial solo por rango igual o mayor, chofer solo por
      // chofer habilitado (esto ultimo ya lo cubre validar('CHOFER', ...)).
      const config = await this.configuracionOrdenService.obtener();
      await this.elegibilidadService.validarReemplazo(
        rol,
        original.bomberoId,
        dto.bomberoId,
        config.exigirRangoIgualOSuperiorOficial,
      );
    } else if (rol) {
      await this.elegibilidadService.validar(rol, dto.bomberoId);
    }

    const asignacion = await this.asignacionRepo.save(
      this.asignacionRepo.create({
        guardiaId,
        bomberoId: dto.bomberoId,
        rol,
        estado: 'ASIGNADO',
        tipoParticipacion: tipoParticipacion as any,
        reemplazaAsignacionId,
        motivo: dto.motivo ?? null,
        observaciones: dto.observaciones ?? null,
        fechaAsignacion: new Date(),
        asignadoPor: actorId,
      }),
    );

    if (reemplazaAsignacionId) {
      await this.asignacionRepo.update(reemplazaAsignacionId, { estado: 'REEMPLAZADO' });
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ASIGNAR_PERSONAL_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacion.id,
      datosDespues: asignacion,
      ip: ip ?? null,
    });
    return asignacion;
  }

  /** Atajo dedicado para reemplazar a alguien en una guardia (seccion 13 del
   * pedido de Orden de Guardia): mismo efecto que `asignarPersonal` con
   * `tipoParticipacion: 'REEMPLAZO'`, pero como accion explicita en vez de
   * un caso mas de la asignacion generica -- el frontend puede ofrecer un
   * boton "Reemplazar" claro sobre cada fila de personal ya asignado. */
  async reemplazarAsignacion(
    guardiaId: string,
    asignacionId: string,
    dto: ReemplazarAsignacionDto,
    actorId: string,
    ip?: string,
  ) {
    await this.findOne(guardiaId);
    const original = await this.asignacionRepo.findOne({ where: { id: asignacionId, guardiaId } });
    if (!original) throw new NotFoundException(`Asignacion ${asignacionId} no encontrada en esta guardia`);
    if (original.estado === 'REEMPLAZADO') throw new BadRequestException('Esta asignacion ya fue reemplazada');

    const bomberoNuevo = await this.bomberoRepo.findOne({ where: { id: dto.bomberoNuevoId } });
    if (!bomberoNuevo) throw new NotFoundException(`Bombero ${dto.bomberoNuevoId} no encontrado`);

    const config = await this.configuracionOrdenService.obtener();
    await this.elegibilidadService.validarReemplazo(
      original.rol,
      original.bomberoId,
      dto.bomberoNuevoId,
      config.exigirRangoIgualOSuperiorOficial,
    );

    const asignacion = await this.asignacionRepo.save(
      this.asignacionRepo.create({
        guardiaId,
        bomberoId: dto.bomberoNuevoId,
        rol: original.rol,
        estado: 'ASIGNADO',
        tipoParticipacion: 'REEMPLAZO',
        reemplazaAsignacionId: original.id,
        motivo: dto.motivo ?? null,
        observaciones: dto.observaciones ?? null,
        fechaAsignacion: new Date(),
        asignadoPor: actorId,
      }),
    );
    await this.asignacionRepo.update(original.id, { estado: 'REEMPLAZADO' });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REEMPLAZAR_ASIGNACION_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacion.id,
      datosAntes: original,
      datosDespues: asignacion,
      ip: ip ?? null,
    });
    return asignacion;
  }

  async quitarAsignacion(guardiaId: string, asignacionId: string, actorId: string, ip?: string) {
    const asignacion = await this.asignacionRepo.findOne({ where: { id: asignacionId, guardiaId } });
    if (!asignacion) throw new NotFoundException(`Asignacion ${asignacionId} no encontrada en esta guardia`);
    await this.asignacionRepo.delete(asignacionId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'QUITAR_ASIGNACION_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacionId,
      datosAntes: asignacion,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }

  async registrarHorario(guardiaId: string, asignacionId: string, dto: RegistrarHorarioDto, actorId: string, ip?: string) {
    const asignacion = await this.asignacionRepo.findOne({ where: { id: asignacionId, guardiaId } });
    if (!asignacion) throw new NotFoundException(`Asignacion ${asignacionId} no encontrada en esta guardia`);

    const anterior = { ...asignacion };
    await this.asignacionRepo.update(asignacionId, {
      ...(dto.horaEntrada !== undefined ? { horaEntrada: new Date(dto.horaEntrada) } : {}),
      ...(dto.horaSalida !== undefined ? { horaSalida: new Date(dto.horaSalida) } : {}),
    });
    const actualizada = await this.asignacionRepo.findOne({ where: { id: asignacionId } });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGISTRAR_HORARIO_ASIGNACION_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacionId,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }

  async actualizarPresencia(guardiaId: string, asignacionId: string, dto: ActualizarPresenciaDto, actorId: string, ip?: string) {
    const asignacion = await this.asignacionRepo.findOne({ where: { id: asignacionId, guardiaId } });
    if (!asignacion) throw new NotFoundException(`Asignacion ${asignacionId} no encontrada en esta guardia`);

    const anterior = { ...asignacion };
    await this.asignacionRepo.update(asignacionId, {
      estadoPresencia: dto.estadoPresencia,
      ...(dto.motivo !== undefined ? { motivo: dto.motivo } : {}),
    });
    const actualizada = await this.asignacionRepo.findOne({ where: { id: asignacionId } });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ACTUALIZAR_PRESENCIA_ASIGNACION_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacionId,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }

  /** Compara el horario programado de la guardia contra las marcaciones
   * reales del bombero (seccion 6: permite mostrar "cumplimiento parcial de
   * guardia"). Misma logica que
   * EventosAsistenciaService.calcularSolapamientoMarcaciones, adaptada al
   * rango fecha+hora de una guardia en vez del rango de un evento. */
  async calcularCumplimiento(guardiaId: string, bomberoId: string) {
    const guardia = await this.findOne(guardiaId);
    const { inicio, fin } = this.rangoGuardia(guardia);
    const inicioMs = inicio.getTime();
    const finMs = fin.getTime();

    const marcaciones = await this.marcacionRepo.find({ where: { bomberoId }, order: { timestampMarcacion: 'ASC' } });

    const relevantes = marcaciones.filter((m) => {
      const t = new Date(m.timestampMarcacion).getTime();
      return t <= finMs && t >= inicioMs - 12 * 60 * 60 * 1000;
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

    const presenciaInicio = new Date(entrada.timestampMarcacion);
    const presenciaFin = salida ? new Date(salida.timestampMarcacion) : null;

    const participacionInicioMs = Math.max(presenciaInicio.getTime(), inicioMs);
    const participacionFinMs = presenciaFin ? Math.min(presenciaFin.getTime(), finMs) : null;

    let duracionParticipacionMinutos: number | null = null;
    let porcentajeParticipacion: number | null = null;
    let estadoSugerido = 'PARCIAL';

    if (participacionFinMs !== null && participacionFinMs > participacionInicioMs) {
      duracionParticipacionMinutos = Math.round((participacionFinMs - participacionInicioMs) / 60000);
      const duracionGuardiaMinutos = Math.round((finMs - inicioMs) / 60000);
      porcentajeParticipacion =
        duracionGuardiaMinutos > 0
          ? Math.min(100, Math.round((duracionParticipacionMinutos / duracionGuardiaMinutos) * 10000) / 100)
          : null;

      const cubrioInicio = presenciaInicio.getTime() <= inicioMs;
      const cubrioFin = presenciaFin !== null && presenciaFin.getTime() >= finMs;
      estadoSugerido = cubrioInicio && cubrioFin ? 'COMPLETA' : 'PARCIAL';
    } else if (participacionFinMs === null && participacionInicioMs < finMs) {
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
}
