import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from '../../shared/entities';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento) private readonly departamentoRepo: Repository<Departamento>,
  ) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.departamentoRepo.createQueryBuilder('d');

    if (!incluirEliminados) {
      query.andWhere('d.eliminadoEn IS NULL');
    }

    if (q) {
      query.andWhere('(d.nombre LIKE :q OR d.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      query.andWhere('d.estado = :estado', { estado });
    }

    query.orderBy('d.nombre', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const departamento = await this.departamentoRepo.findOne({ where: { id } });
    if (!departamento) throw new NotFoundException(`Departamento ${id} no encontrado`);
    return departamento;
  }

  async create(dto: CreateDepartamentoDto, actorId: string) {
    const existente = await this.departamentoRepo.findOne({
      where: [{ codigo: dto.codigo }, { nombre: dto.nombre }],
    });
    if (existente) {
      if (existente.codigo === dto.codigo) {
        throw new ConflictException(`Ya existe un departamento con el codigo "${dto.codigo}"`);
      }
      throw new ConflictException(`Ya existe un departamento llamado "${dto.nombre}"`);
    }

    return this.departamentoRepo.save(
      this.departamentoRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        estado: dto.estado ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateDepartamentoDto, actorId: string) {
    await this.findOne(id);

    await this.departamentoRepo.update(id, {
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

    await this.departamentoRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);

    await this.departamentoRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll();
    return filas.map((d) => ({
      codigo: d.codigo,
      nombre: d.nombre,
      descripcion: d.descripcion,
      estado: d.estado,
      creadoEn: d.creadoEn,
      actualizadoEn: d.actualizadoEn,
    }));
  }
}
