import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorExterno } from '../../shared/entities';
import { InstructorExternoDto } from './dto/instructor-externo.dto';

@Injectable()
export class InstructoresExternosService {
  constructor(
    @InjectRepository(InstructorExterno) private readonly repo: Repository<InstructorExterno>,
  ) {}

  findAll(q?: string) {
    const query = this.repo.createQueryBuilder('i').orderBy('i.nombre', 'ASC');
    if (q) {
      query.andWhere('(i.nombre LIKE :q OR i.apellido LIKE :q OR i.documento LIKE :q)', { q: `%${q}%` });
    }
    return query.getMany();
  }

  async findOne(id: string) {
    const instructor = await this.repo.findOne({ where: { id } });
    if (!instructor) throw new NotFoundException(`Instructor externo ${id} no encontrado`);
    return instructor;
  }

  async create(dto: InstructorExternoDto) {
    return this.repo.save(
      this.repo.create({
        nombre: dto.nombre,
        apellido: dto.apellido ?? null,
        documento: dto.documento ?? null,
        institucion: dto.institucion ?? null,
        especialidad: dto.especialidad ?? null,
        telefono: dto.telefono ?? null,
        email: dto.email ?? null,
        observaciones: dto.observaciones ?? null,
        activo: dto.activo ?? true,
      }),
    );
  }

  async update(id: string, dto: Partial<InstructorExternoDto>) {
    await this.findOne(id);
    await this.repo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.apellido !== undefined ? { apellido: dto.apellido } : {}),
      ...(dto.documento !== undefined ? { documento: dto.documento } : {}),
      ...(dto.institucion !== undefined ? { institucion: dto.institucion } : {}),
      ...(dto.especialidad !== undefined ? { especialidad: dto.especialidad } : {}),
      ...(dto.telefono !== undefined ? { telefono: dto.telefono } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
    });
    return this.findOne(id);
  }
}
