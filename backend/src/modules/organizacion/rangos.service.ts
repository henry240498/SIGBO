import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rango } from '../../shared/entities';
import { CreateRangoDto } from './dto/create-rango.dto';
import { UpdateRangoDto } from './dto/update-rango.dto';

@Injectable()
export class RangosService {
  constructor(@InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const qb = this.rangoRepo.createQueryBuilder('r');

    if (!incluirEliminados) {
      qb.andWhere('r.eliminadoEn IS NULL');
    }

    if (q) {
      qb.andWhere('(r.nombre LIKE :q OR r.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      qb.andWhere('r.estado = :estado', { estado });
    }

    qb.orderBy('r.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const rango = await this.rangoRepo.findOne({ where: { id } });
    if (!rango) throw new NotFoundException(`Rango ${id} no encontrado`);
    return rango;
  }

  async create(dto: CreateRangoDto, actorId: string) {
    const existentePorCodigo = await this.rangoRepo.findOne({ where: { codigo: dto.codigo } });
    if (existentePorCodigo) {
      throw new ConflictException(`Ya existe un rango con el codigo "${dto.codigo}"`);
    }

    const existentePorNombre = await this.rangoRepo.findOne({ where: { nombre: dto.nombre } });
    if (existentePorNombre) {
      throw new ConflictException(`Ya existe un rango llamado "${dto.nombre}"`);
    }

    return this.rangoRepo.save(
      this.rangoRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        nivelJerarquico: dto.nivelJerarquico ?? 0,
        descripcion: dto.descripcion ?? null,
        insigniaUrl: dto.insigniaUrl ?? null,
        color: dto.color ?? '#6B7280',
        ordenJerarquico: dto.ordenJerarquico ?? 0,
        estado: dto.estado ?? 'ACTIVO',
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateRangoDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const existente = await this.rangoRepo.findOne({ where: { codigo: dto.codigo } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un rango con el codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const existente = await this.rangoRepo.findOne({ where: { nombre: dto.nombre } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un rango llamado "${dto.nombre}"`);
      }
    }

    await this.rangoRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.nivelJerarquico !== undefined ? { nivelJerarquico: dto.nivelJerarquico } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.insigniaUrl !== undefined ? { insigniaUrl: dto.insigniaUrl } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
      ...(dto.ordenJerarquico !== undefined ? { ordenJerarquico: dto.ordenJerarquico } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.rangoRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.rangoRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async filasExportables() {
    const rangos = await this.findAll();
    return rangos.map((r) => ({
      codigo: r.codigo,
      nombre: r.nombre,
      nivelJerarquico: r.nivelJerarquico,
      descripcion: r.descripcion,
      insigniaUrl: r.insigniaUrl,
      color: r.color,
      ordenJerarquico: r.ordenJerarquico,
      estado: r.estado,
      observaciones: r.observaciones,
      creadoEn: r.creadoEn,
    }));
  }
}
