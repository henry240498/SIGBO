import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compania } from '../../shared/entities';
import { CreateCompaniaDto } from './dto/create-compania.dto';
import { UpdateCompaniaDto } from './dto/update-compania.dto';

@Injectable()
export class CompaniasService {
  constructor(
    @InjectRepository(Compania) private readonly companiaRepo: Repository<Compania>,
  ) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.companiaRepo.createQueryBuilder('c');

    if (!incluirEliminados) {
      query.andWhere('c.eliminadoEn IS NULL');
    }

    if (q) {
      query.andWhere('(c.nombre LIKE :q OR c.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      query.andWhere('c.estado = :estado', { estado });
    }

    query.orderBy('c.nombre', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const compania = await this.companiaRepo.findOne({ where: { id } });
    if (!compania) throw new NotFoundException(`Compania ${id} no encontrada`);
    return compania;
  }

  async create(dto: CreateCompaniaDto, actorId: string) {
    const existentePorCodigo = await this.companiaRepo.findOne({ where: { codigo: dto.codigo } });
    if (existentePorCodigo) {
      throw new ConflictException(`Ya existe una compania con el codigo "${dto.codigo}"`);
    }

    const existentePorNombre = await this.companiaRepo.findOne({ where: { nombre: dto.nombre } });
    if (existentePorNombre) {
      throw new ConflictException(`Ya existe una compania llamada "${dto.nombre}"`);
    }

    return this.companiaRepo.save(
      this.companiaRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        ciudad: dto.ciudad ?? null,
        direccion: dto.direccion ?? null,
        fechaCreacion: dto.fechaCreacion ?? null,
        estado: dto.estado ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateCompaniaDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const existentePorCodigo = await this.companiaRepo.findOne({ where: { codigo: dto.codigo } });
      if (existentePorCodigo && existentePorCodigo.id !== id) {
        throw new ConflictException(`Ya existe una compania con el codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const existentePorNombre = await this.companiaRepo.findOne({ where: { nombre: dto.nombre } });
      if (existentePorNombre && existentePorNombre.id !== id) {
        throw new ConflictException(`Ya existe una compania llamada "${dto.nombre}"`);
      }
    }

    await this.companiaRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.ciudad !== undefined ? { ciudad: dto.ciudad } : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.fechaCreacion !== undefined ? { fechaCreacion: dto.fechaCreacion } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);

    await this.companiaRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);

    await this.companiaRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll();
    return filas.map((c) => ({
      codigo: c.codigo,
      nombre: c.nombre,
      ciudad: c.ciudad,
      direccion: c.direccion,
      fechaCreacion: c.fechaCreacion,
      estado: c.estado,
    }));
  }
}
