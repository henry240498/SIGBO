import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  Bombero,
  InstructorActividadAcademica,
  InstructorExterno,
  Rango,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateActividadAcademicaDto } from './dto/create-actividad-academica.dto';
import { UpdateActividadAcademicaDto } from './dto/update-actividad-academica.dto';
import { AsignarInstructorDto } from './dto/asignar-instructor.dto';

@Injectable()
export class ActividadesAcademicasService {
  constructor(
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(InstructorActividadAcademica) private readonly instructorActRepo: Repository<InstructorActividadAcademica>,
    @InjectRepository(InstructorExterno) private readonly instructorExtRepo: Repository<InstructorExterno>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { tipoActividadId?: string; estado?: string; esExterna?: string; desde?: string; hasta?: string }) {
    const query = this.actividadRepo.createQueryBuilder('a').orderBy('a.fechaInicio', 'DESC');
    if (filtros.tipoActividadId) query.andWhere('a.tipoActividadId = :tipoActividadId', { tipoActividadId: filtros.tipoActividadId });
    if (filtros.estado) query.andWhere('a.estado = :estado', { estado: filtros.estado });
    if (filtros.esExterna !== undefined) query.andWhere('a.esExterna = :esExterna', { esExterna: filtros.esExterna === 'true' });
    if (filtros.desde) query.andWhere('a.fechaFin >= :desde', { desde: filtros.desde });
    if (filtros.hasta) query.andWhere('a.fechaInicio <= :hasta', { hasta: filtros.hasta });
    return query.getMany();
  }

  async findOne(id: string) {
    const actividad = await this.actividadRepo.findOne({ where: { id } });
    if (!actividad) throw new NotFoundException(`Actividad academica ${id} no encontrada`);
    return actividad;
  }

  private validarFechas(fechaInicio: string, fechaFin: string) {
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
  }

  async create(dto: CreateActividadAcademicaDto, actorId: string, ip?: string) {
    this.validarFechas(dto.fechaInicio, dto.fechaFin);
    const actividad = await this.actividadRepo.save(
      this.actividadRepo.create({
        codigo: dto.codigo ?? null,
        nombre: dto.nombre,
        tipoActividadId: dto.tipoActividadId,
        descripcion: dto.descripcion ?? null,
        objetivo: dto.objetivo ?? null,
        institucionOrganizadora: dto.institucionOrganizadora ?? null,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        horaInicio: dto.horaInicio ?? null,
        horaFin: dto.horaFin ?? null,
        duracionHoras: dto.duracionHoras ?? null,
        modalidadId: dto.modalidadId ?? null,
        lugar: dto.lugar ?? null,
        responsableBomberoId: dto.responsableBomberoId ?? null,
        cupo: dto.cupo ?? null,
        requisitos: dto.requisitos ?? null,
        estado: (dto.estado as any) ?? 'PLANIFICADA',
        observaciones: dto.observaciones ?? null,
        esExterna: dto.esExterna ?? false,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'academia.actividades',
      recursoId: actividad.id,
      datosDespues: actividad,
      ip: ip ?? null,
    });
    return actividad;
  }

  async update(id: string, dto: UpdateActividadAcademicaDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);
    if (dto.fechaInicio !== undefined || dto.fechaFin !== undefined) {
      this.validarFechas(dto.fechaInicio ?? anterior.fechaInicio, dto.fechaFin ?? anterior.fechaFin);
    }
    await this.actividadRepo.update(id, { ...dto, actualizadoPor: actorId } as any);
    const actualizado = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ACTUALIZAR',
      recurso: 'academia.actividades',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  /** Resuelve nombre/rango de cada instructor (bombero o externo) para no
   * dejarle esa tarea al frontend -- mismo criterio que ya usa Guardias con
   * PersonaResumen. */
  async listarInstructores(actividadId: string) {
    await this.findOne(actividadId);
    const instructores = await this.instructorActRepo.find({ where: { actividadId }, order: { creadoEn: 'ASC' } });
    if (instructores.length === 0) return [];

    const bomberoIds = instructores.filter((i) => i.bomberoId).map((i) => i.bomberoId as string);
    const externoIds = instructores.filter((i) => i.instructorExternoId).map((i) => i.instructorExternoId as string);

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
      ? await this.instructorExtRepo.createQueryBuilder('e').where('e.id IN (:...ids)', { ids: externoIds }).getMany()
      : [];
    const externoPorId = new Map(externos.map((e) => [e.id, e]));

    return instructores.map((i) => {
      if (i.bomberoId) {
        const b = bomberoPorId.get(i.bomberoId);
        return {
          id: i.id,
          rolInstructor: i.rolInstructor,
          tipo: 'PERSONAL' as const,
          bomberoId: i.bomberoId,
          numeroBombero: b?.numeroBombero ?? null,
          nombreCompleto: b ? `${b.nombre} ${b.apellido}` : '(bombero no encontrado)',
          rango: (b?.rangoId ? rangoPorId.get(b.rangoId)?.nombre : null) ?? b?.rango ?? null,
        };
      }
      const e = externoPorId.get(i.instructorExternoId as string);
      return {
        id: i.id,
        rolInstructor: i.rolInstructor,
        tipo: 'EXTERNO' as const,
        instructorExternoId: i.instructorExternoId,
        nombreCompleto: e ? `${e.nombre} ${e.apellido ?? ''}`.trim() : '(instructor externo no encontrado)',
        institucion: e?.institucion ?? null,
        especialidad: e?.especialidad ?? null,
      };
    });
  }

  async asignarInstructor(actividadId: string, dto: AsignarInstructorDto, actorId: string, ip?: string) {
    await this.findOne(actividadId);

    if (!dto.bomberoId && !dto.externo) {
      throw new BadRequestException('Debe indicar bomberoId o los datos de un instructor externo');
    }
    if (dto.bomberoId && dto.externo) {
      throw new BadRequestException('No se puede indicar bomberoId e instructor externo al mismo tiempo');
    }

    let bomberoId: string | null = null;
    let instructorExternoId: string | null = null;

    if (dto.bomberoId) {
      const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
      if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);
      bomberoId = dto.bomberoId;
    } else if (dto.externo) {
      const externo = await this.instructorExtRepo.save(
        this.instructorExtRepo.create({
          nombre: dto.externo.nombre,
          apellido: dto.externo.apellido ?? null,
          documento: dto.externo.documento ?? null,
          institucion: dto.externo.institucion ?? null,
          especialidad: dto.externo.especialidad ?? null,
          telefono: dto.externo.telefono ?? null,
          email: dto.externo.email ?? null,
          observaciones: dto.externo.observaciones ?? null,
        }),
      );
      instructorExternoId = externo.id;
    }

    const instructor = await this.instructorActRepo.save(
      this.instructorActRepo.create({
        actividadId,
        bomberoId,
        instructorExternoId,
        rolInstructor: (dto.rolInstructor as any) ?? 'PRINCIPAL',
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ASIGNAR_INSTRUCTOR',
      recurso: 'academia.actividades',
      recursoId: actividadId,
      datosDespues: instructor,
      ip: ip ?? null,
    });
    return instructor;
  }

  async quitarInstructor(actividadId: string, instructorId: string, actorId: string, ip?: string) {
    await this.findOne(actividadId);
    const instructor = await this.instructorActRepo.findOne({ where: { id: instructorId, actividadId } });
    if (!instructor) throw new NotFoundException(`Instructor ${instructorId} no encontrado en esta actividad`);

    await this.instructorActRepo.delete(instructorId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'QUITAR_INSTRUCTOR',
      recurso: 'academia.actividades',
      recursoId: actividadId,
      datosAntes: instructor,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
