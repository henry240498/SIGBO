import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brigada } from '../../shared/entities';
import { CreateBrigadaDto } from './dto/create-brigada.dto';
import { UpdateBrigadaDto } from './dto/update-brigada.dto';

@Injectable()
export class BrigadasService {
  constructor(@InjectRepository(Brigada) private readonly brigadaRepo: Repository<Brigada>) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const qb = this.brigadaRepo.createQueryBuilder('b');

    if (!incluirEliminados) {
      qb.andWhere('b.eliminadoEn IS NULL');
    }

    if (estado) {
      qb.andWhere('b.estado = :estado', { estado });
    }

    if (q) {
      qb.andWhere('(b.nombre LIKE :q OR b.codigo LIKE :q)', { q: `%${q}%` });
    }

    qb.orderBy('b.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const brigada = await this.brigadaRepo.findOne({ where: { id } });
    if (!brigada) throw new NotFoundException(`Brigada ${id} no encontrada`);
    return brigada;
  }

  async create(dto: CreateBrigadaDto, actorId: string) {
    const existente = await this.brigadaRepo.findOne({
      where: [{ codigo: dto.codigo }, { nombre: dto.nombre }],
    });
    if (existente) {
      if (existente.codigo === dto.codigo) {
        throw new ConflictException(`Ya existe una brigada con el codigo "${dto.codigo}"`);
      }
      throw new ConflictException(`Ya existe una brigada llamada "${dto.nombre}"`);
    }

    const brigada = this.brigadaRepo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      estado: dto.estado ?? 'ACTIVO',
      creadoPor: actorId,
    });

    return this.brigadaRepo.save(brigada);
  }

  async update(id: string, dto: UpdateBrigadaDto, actorId: string) {
    await this.findOne(id);

    await this.brigadaRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);

    await this.brigadaRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);

    await this.brigadaRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll(undefined, undefined, false);

    return filas.map((b) => ({
      codigo: b.codigo,
      nombre: b.nombre,
      descripcion: b.descripcion,
      estado: b.estado,
      creadoEn: b.creadoEn,
    }));
  }
}
