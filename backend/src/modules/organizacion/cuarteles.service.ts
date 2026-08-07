import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuartel } from '../../shared/entities';
import { CreateCuartelDto } from './dto/create-cuartele.dto';
import { UpdateCuartelDto } from './dto/update-cuartele.dto';

@Injectable()
export class CuartelsService {
  constructor(@InjectRepository(Cuartel) private readonly cuartelRepo: Repository<Cuartel>) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.cuartelRepo.createQueryBuilder('cuartel');

    if (!incluirEliminados) {
      query.andWhere('cuartel.eliminadoEn IS NULL');
    }

    if (q) {
      query.andWhere('(cuartel.nombre LIKE :q OR cuartel.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      query.andWhere('cuartel.estado = :estado', { estado });
    }

    query.orderBy('cuartel.nombre', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const cuartel = await this.cuartelRepo.findOne({ where: { id } });
    if (!cuartel) throw new NotFoundException(`Cuartel ${id} no encontrado`);
    return cuartel;
  }

  async create(dto: CreateCuartelDto, actorId: string) {
    const existente = await this.cuartelRepo.findOne({
      where: [{ codigo: dto.codigo }, { nombre: dto.nombre }],
    });
    if (existente) {
      throw new ConflictException('Ya existe un cuartel con ese codigo o nombre');
    }

    const cuartel = this.cuartelRepo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      companiaId: dto.companiaId,
      direccion: dto.direccion ?? null,
      telefono: dto.telefono ?? null,
      responsableBomberoId: dto.responsableBomberoId ?? null,
      estado: (dto.estado as 'ACTIVO' | 'INACTIVO') ?? 'ACTIVO',
      creadoPor: actorId,
    });

    return this.cuartelRepo.save(cuartel);
  }

  async update(id: string, dto: UpdateCuartelDto, actorId: string) {
    await this.findOne(id);

    await this.cuartelRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.companiaId !== undefined ? { companiaId: dto.companiaId } : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.telefono !== undefined ? { telefono: dto.telefono } : {}),
      ...(dto.responsableBomberoId !== undefined
        ? { responsableBomberoId: dto.responsableBomberoId }
        : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as 'ACTIVO' | 'INACTIVO' } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.cuartelRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.cuartelRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll(undefined, undefined, false);
    return filas.map((c) => ({
      codigo: c.codigo,
      nombre: c.nombre,
      companiaId: c.companiaId,
      direccion: c.direccion,
      telefono: c.telefono,
      responsableBomberoId: c.responsableBomberoId,
      estado: c.estado,
      creadoEn: c.creadoEn,
    }));
  }
}
