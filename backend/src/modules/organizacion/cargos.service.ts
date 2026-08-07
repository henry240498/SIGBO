import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from '../../shared/entities';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Injectable()
export class CargosService {
  constructor(@InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const qb = this.cargoRepo.createQueryBuilder('c');

    if (!incluirEliminados) {
      qb.andWhere('c.eliminadoEn IS NULL');
    }

    if (q) {
      qb.andWhere('(c.nombre LIKE :q OR c.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      qb.andWhere('c.estado = :estado', { estado });
    }

    qb.orderBy('c.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const cargo = await this.cargoRepo.findOne({ where: { id } });
    if (!cargo) throw new NotFoundException(`Cargo ${id} no encontrado`);
    return cargo;
  }

  async create(dto: CreateCargoDto, actorId: string) {
    const existentePorCodigo = await this.cargoRepo.findOne({ where: { codigo: dto.codigo } });
    if (existentePorCodigo) {
      throw new ConflictException(`Ya existe un cargo con el codigo "${dto.codigo}"`);
    }

    const existentePorNombre = await this.cargoRepo.findOne({ where: { nombre: dto.nombre } });
    if (existentePorNombre) {
      throw new ConflictException(`Ya existe un cargo llamado "${dto.nombre}"`);
    }

    return this.cargoRepo.save(
      this.cargoRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        area: dto.area ?? null,
        nivel: dto.nivel ?? null,
        dependenciaCargoId: dto.dependenciaCargoId ?? null,
        estado: dto.estado ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateCargoDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const existente = await this.cargoRepo.findOne({ where: { codigo: dto.codigo } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un cargo con el codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const existente = await this.cargoRepo.findOne({ where: { nombre: dto.nombre } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un cargo llamado "${dto.nombre}"`);
      }
    }

    await this.cargoRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.area !== undefined ? { area: dto.area } : {}),
      ...(dto.nivel !== undefined ? { nivel: dto.nivel } : {}),
      ...(dto.dependenciaCargoId !== undefined ? { dependenciaCargoId: dto.dependenciaCargoId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.cargoRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.cargoRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async filasExportables() {
    const cargos = await this.findAll();
    return cargos.map((c) => ({
      codigo: c.codigo,
      nombre: c.nombre,
      descripcion: c.descripcion,
      area: c.area,
      nivel: c.nivel,
      dependenciaCargoId: c.dependenciaCargoId,
      estado: c.estado,
      creadoEn: c.creadoEn,
    }));
  }
}
