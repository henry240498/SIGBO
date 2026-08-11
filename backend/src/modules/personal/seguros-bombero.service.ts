import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, SeguroBombero } from '../../shared/entities';
import { CreateSeguroBomberoDto } from './dto/create-seguro-bombero.dto';
import { UpdateSeguroBomberoDto } from './dto/update-seguro-bombero.dto';

@Injectable()
export class SegurosBomberoService {
  constructor(
    @InjectRepository(SeguroBombero) private readonly seguroRepo: Repository<SeguroBombero>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
  ) {}

  listar(bomberoId: string) {
    return this.seguroRepo.find({ where: { bomberoId }, order: { creadoEn: 'DESC' } });
  }

  async findOne(bomberoId: string, id: string) {
    const seguro = await this.seguroRepo.findOne({ where: { id, bomberoId } });
    if (!seguro) throw new NotFoundException(`Seguro ${id} no encontrado para este bombero`);
    return seguro;
  }

  async crear(bomberoId: string, dto: CreateSeguroBomberoDto, actorId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    return this.seguroRepo.save(
      this.seguroRepo.create({
        bomberoId,
        aseguradoraId: dto.aseguradoraId ?? null,
        tipoSeguroId: dto.tipoSeguroId ?? null,
        descripcion: dto.descripcion ?? null,
        numeroPoliza: dto.numeroPoliza ?? null,
        fechaInicio: dto.fechaInicio ?? null,
        fechaVencimiento: dto.fechaVencimiento ?? null,
        estado: (dto.estado as any) ?? 'ACTIVO',
        observaciones: dto.observaciones ?? null,
        documentacionUrl: dto.documentacionUrl ?? null,
        creadoPor: actorId,
      }),
    );
  }

  async actualizar(bomberoId: string, id: string, dto: UpdateSeguroBomberoDto) {
    await this.findOne(bomberoId, id);
    await this.seguroRepo.update(id, {
      ...(dto.aseguradoraId !== undefined ? { aseguradoraId: dto.aseguradoraId } : {}),
      ...(dto.tipoSeguroId !== undefined ? { tipoSeguroId: dto.tipoSeguroId } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.numeroPoliza !== undefined ? { numeroPoliza: dto.numeroPoliza } : {}),
      ...(dto.fechaInicio !== undefined ? { fechaInicio: dto.fechaInicio } : {}),
      ...(dto.fechaVencimiento !== undefined ? { fechaVencimiento: dto.fechaVencimiento } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      ...(dto.documentacionUrl !== undefined ? { documentacionUrl: dto.documentacionUrl } : {}),
    });
    return this.findOne(bomberoId, id);
  }

  async darBaja(bomberoId: string, id: string) {
    await this.findOne(bomberoId, id);
    await this.seguroRepo.update(id, { estado: 'INACTIVO' });
    return this.findOne(bomberoId, id);
  }
}
