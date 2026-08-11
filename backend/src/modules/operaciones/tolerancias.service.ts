import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ToleranciaAsistencia } from '../../shared/entities';
import { ToleranciaAsistenciaDto } from './dto/tolerancia-asistencia.dto';

@Injectable()
export class ToleranciasService {
  constructor(@InjectRepository(ToleranciaAsistencia) private readonly repo: Repository<ToleranciaAsistencia>) {}

  findAll() {
    return this.repo.find({ where: { estado: 'ACTIVO' } });
  }

  async findOne(id: string) {
    const tolerancia = await this.repo.findOne({ where: { id } });
    if (!tolerancia) throw new NotFoundException(`Tolerancia ${id} no encontrada`);
    return tolerancia;
  }

  create(dto: ToleranciaAsistenciaDto) {
    return this.repo.save(
      this.repo.create({
        tipoEventoId: dto.tipoEventoId ?? null,
        minutosToleranciaEntrada: dto.minutosToleranciaEntrada,
        minutosToleranciaSalida: dto.minutosToleranciaSalida,
        estado: (dto.estado as any) ?? 'ACTIVO',
      }),
    );
  }

  async update(id: string, dto: Partial<ToleranciaAsistenciaDto>) {
    await this.findOne(id);
    await this.repo.update(id, {
      ...(dto.tipoEventoId !== undefined ? { tipoEventoId: dto.tipoEventoId } : {}),
      ...(dto.minutosToleranciaEntrada !== undefined ? { minutosToleranciaEntrada: dto.minutosToleranciaEntrada } : {}),
      ...(dto.minutosToleranciaSalida !== undefined ? { minutosToleranciaSalida: dto.minutosToleranciaSalida } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
    });
    return this.findOne(id);
  }

  /** Busca la tolerancia especifica del tipo de evento; si no existe, cae a
   * la regla general (tipoEventoId NULL); si tampoco existe, cero tolerancia. */
  async resolverPara(tipoEventoId: string | null) {
    if (tipoEventoId) {
      const especifica = await this.repo.findOne({ where: { tipoEventoId, estado: 'ACTIVO' } });
      if (especifica) return especifica;
    }
    const general = await this.repo.findOne({ where: { tipoEventoId: IsNull(), estado: 'ACTIVO' } });
    return general ?? { minutosToleranciaEntrada: 0, minutosToleranciaSalida: 0 };
  }
}
