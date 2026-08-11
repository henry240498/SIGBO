import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItemVehiculo } from '../../shared/entities';
import { CreateChecklistItemVehiculoDto, UpdateChecklistItemVehiculoDto } from './dto/checklist-item-vehiculo.dto';

@Injectable()
export class ChecklistItemsService {
  constructor(
    @InjectRepository(ChecklistItemVehiculo) private readonly repo: Repository<ChecklistItemVehiculo>,
  ) {}

  findAll(tipoVehiculo?: string, soloActivos?: boolean) {
    const qb = this.repo.createQueryBuilder('c');
    if (tipoVehiculo) {
      qb.andWhere('(c.tipoVehiculo = :tipoVehiculo OR c.tipoVehiculo IS NULL)', { tipoVehiculo });
    }
    if (soloActivos) {
      qb.andWhere('c.activo = 1');
    }
    qb.orderBy('c.orden', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Item de checklist ${id} no encontrado`);
    return item;
  }

  create(dto: CreateChecklistItemVehiculoDto) {
    return this.repo.save(
      this.repo.create({
        tipoVehiculo: dto.tipoVehiculo ?? null,
        nombre: dto.nombre,
        categoria: dto.categoria ?? 'MECANICA',
        orden: dto.orden ?? 0,
      }),
    );
  }

  async update(id: string, dto: UpdateChecklistItemVehiculoDto) {
    await this.findOne(id);
    await this.repo.update(id, { ...dto } as Partial<ChecklistItemVehiculo>);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return { eliminado: true };
  }
}
