import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unidad } from '../../shared/entities';
import { CreateUnidadDto } from './dto/create-unidade.dto';
import { UpdateUnidadDto } from './dto/update-unidade.dto';

@Injectable()
export class UnidadesService {
  constructor(
    @InjectRepository(Unidad) private readonly unidadRepo: Repository<Unidad>,
  ) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const qb = this.unidadRepo.createQueryBuilder('u');

    if (!incluirEliminados) {
      qb.andWhere('u.eliminadoEn IS NULL');
    }

    if (q) {
      qb.andWhere('(u.nombre LIKE :q OR u.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      qb.andWhere('u.estado = :estado', { estado });
    }

    qb.orderBy('u.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const unidad = await this.unidadRepo.findOne({ where: { id } });
    if (!unidad) throw new NotFoundException(`Unidad ${id} no encontrada`);
    return unidad;
  }

  async create(dto: CreateUnidadDto, actorId: string) {
    const existentePorCodigo = await this.unidadRepo.findOne({ where: { codigo: dto.codigo } });
    if (existentePorCodigo) {
      throw new ConflictException(`Ya existe una unidad con el codigo "${dto.codigo}"`);
    }

    const existentePorNombre = await this.unidadRepo.findOne({ where: { nombre: dto.nombre } });
    if (existentePorNombre) {
      throw new ConflictException(`Ya existe una unidad llamada "${dto.nombre}"`);
    }

    const unidad = await this.unidadRepo.save(
      this.unidadRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        brigadaId: dto.brigadaId ?? null,
        estado: dto.estado ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );

    return unidad;
  }

  async update(id: string, dto: UpdateUnidadDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const existentePorCodigo = await this.unidadRepo.findOne({ where: { codigo: dto.codigo } });
      if (existentePorCodigo && existentePorCodigo.id !== id) {
        throw new ConflictException(`Ya existe una unidad con el codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const existentePorNombre = await this.unidadRepo.findOne({ where: { nombre: dto.nombre } });
      if (existentePorNombre && existentePorNombre.id !== id) {
        throw new ConflictException(`Ya existe una unidad llamada "${dto.nombre}"`);
      }
    }

    await this.unidadRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.brigadaId !== undefined ? { brigadaId: dto.brigadaId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);

    await this.unidadRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);

    await this.unidadRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll(undefined, undefined, false);
    return filas.map((u) => ({
      codigo: u.codigo,
      nombre: u.nombre,
      descripcion: u.descripcion,
      brigadaId: u.brigadaId,
      estado: u.estado,
      creadoEn: u.creadoEn,
      actualizadoEn: u.actualizadoEn,
    }));
  }
}
