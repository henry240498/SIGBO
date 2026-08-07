import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turno } from '../../shared/entities';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

@Injectable()
export class TurnosService {
  constructor(@InjectRepository(Turno) private readonly turnoRepo: Repository<Turno>) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const qb = this.turnoRepo.createQueryBuilder('t');

    if (!incluirEliminados) {
      qb.andWhere('t.eliminadoEn IS NULL');
    }

    if (q) {
      qb.andWhere('(t.nombre LIKE :q OR t.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      qb.andWhere('t.estado = :estado', { estado });
    }

    qb.orderBy('t.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const turno = await this.turnoRepo.findOne({ where: { id } });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);
    return turno;
  }

  async create(dto: CreateTurnoDto, actorId: string) {
    const porCodigo = await this.turnoRepo.findOne({ where: { codigo: dto.codigo } });
    if (porCodigo) throw new ConflictException(`Ya existe un turno con el codigo "${dto.codigo}"`);

    const porNombre = await this.turnoRepo.findOne({ where: { nombre: dto.nombre } });
    if (porNombre) throw new ConflictException(`Ya existe un turno con el nombre "${dto.nombre}"`);

    const turno = this.turnoRepo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      horaInicio: dto.horaInicio ?? null,
      horaFin: dto.horaFin ?? null,
      responsableBomberoId: dto.responsableBomberoId ?? null,
      estado: (dto.estado as 'ACTIVO' | 'INACTIVO') ?? 'ACTIVO',
      creadoPor: actorId,
    });

    return this.turnoRepo.save(turno);
  }

  async update(id: string, dto: UpdateTurnoDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const porCodigo = await this.turnoRepo.findOne({ where: { codigo: dto.codigo } });
      if (porCodigo && porCodigo.id !== id) {
        throw new ConflictException(`Ya existe un turno con el codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const porNombre = await this.turnoRepo.findOne({ where: { nombre: dto.nombre } });
      if (porNombre && porNombre.id !== id) {
        throw new ConflictException(`Ya existe un turno con el nombre "${dto.nombre}"`);
      }
    }

    await this.turnoRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.horaInicio !== undefined ? { horaInicio: dto.horaInicio } : {}),
      ...(dto.horaFin !== undefined ? { horaFin: dto.horaFin } : {}),
      ...(dto.responsableBomberoId !== undefined ? { responsableBomberoId: dto.responsableBomberoId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as 'ACTIVO' | 'INACTIVO' } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);

    await this.turnoRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);

    await this.turnoRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async filasExportables() {
    const turnos = await this.findAll();

    return turnos.map((t) => ({
      codigo: t.codigo,
      nombre: t.nombre,
      horaInicio: t.horaInicio,
      horaFin: t.horaFin,
      responsableBomberoId: t.responsableBomberoId,
      estado: t.estado,
      creadoEn: t.creadoEn,
    }));
  }
}
