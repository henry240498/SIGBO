import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadProfesional, Bombero } from '../../shared/entities';
import { ActividadProfesionalDto } from './dto/actividad-profesional.dto';

@Injectable()
export class ActividadProfesionalService {
  constructor(
    @InjectRepository(ActividadProfesional)
    private readonly actividadRepo: Repository<ActividadProfesional>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
  ) {}

  async obtener(bomberoId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    return this.actividadRepo.findOne({ where: { bomberoId } });
  }

  async actualizar(bomberoId: string, dto: ActividadProfesionalDto) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    const existente = await this.actividadRepo.findOne({ where: { bomberoId } });

    if (existente) {
      await this.actividadRepo.update({ bomberoId }, dto);
    } else {
      await this.actividadRepo.save(this.actividadRepo.create({ bomberoId, ...dto }));
    }

    return this.obtener(bomberoId);
  }
}
