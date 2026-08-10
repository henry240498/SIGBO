import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipanteExterno } from '../../shared/entities';
import { ParticipanteExternoDto } from './dto/participante-externo.dto';

@Injectable()
export class ParticipantesExternosService {
  constructor(@InjectRepository(ParticipanteExterno) private readonly repo: Repository<ParticipanteExterno>) {}

  findAll(q?: string) {
    const query = this.repo.createQueryBuilder('x').orderBy('x.creadoEn', 'DESC');
    if (q) {
      query.andWhere('(x.nombre LIKE :q OR x.apellido LIKE :q OR x.cedula LIKE :q)', { q: `%${q}%` });
    }
    return query.getMany();
  }

  async findOne(id: string) {
    const externo = await this.repo.findOne({ where: { id } });
    if (!externo) throw new NotFoundException(`Participante externo ${id} no encontrado`);
    return externo;
  }

  create(dto: ParticipanteExternoDto, actorId: string) {
    return this.repo.save(
      this.repo.create({
        cedula: dto.cedula ?? null,
        nombre: dto.nombre,
        apellido: dto.apellido ?? null,
        celular: dto.celular ?? null,
        institucionProcedencia: dto.institucionProcedencia ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: Partial<ParticipanteExternoDto>) {
    await this.findOne(id);
    await this.repo.update(id, {
      ...(dto.cedula !== undefined ? { cedula: dto.cedula } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.apellido !== undefined ? { apellido: dto.apellido } : {}),
      ...(dto.celular !== undefined ? { celular: dto.celular } : {}),
      ...(dto.institucionProcedencia !== undefined ? { institucionProcedencia: dto.institucionProcedencia } : {}),
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
    });
    return this.findOne(id);
  }
}
