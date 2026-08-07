import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, HistorialInstitucional } from '../../shared/entities';
import { CrearMovimientoHistorialDto } from './dto/crear-movimiento-historial.dto';

@Injectable()
export class HistorialInstitucionalService {
  constructor(
    @InjectRepository(HistorialInstitucional)
    private readonly historialRepo: Repository<HistorialInstitucional>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
  ) {}

  async listar(bomberoId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    return this.historialRepo.find({
      where: { bomberoId },
      order: { fecha: 'DESC' },
    });
  }

  async registrarManual(bomberoId: string, dto: CrearMovimientoHistorialDto, usuarioId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    await this.historialRepo.save(
      this.historialRepo.create({
        bomberoId,
        ...dto,
        usuarioResponsableId: usuarioId,
      } as Partial<HistorialInstitucional>),
    );

    return this.listar(bomberoId);
  }
}
