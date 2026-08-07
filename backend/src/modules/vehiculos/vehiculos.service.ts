import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from '../../shared/entities';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(@InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>) {}

  findAll(estado?: string) {
    return this.vehiculoRepo.find({
      where: estado ? { estado: estado as Vehiculo['estado'] } : undefined,
      order: { numeroInterno: 'ASC' },
    });
  }

  async findOne(id: string) {
    const vehiculo = await this.vehiculoRepo.findOne({ where: { id } });
    if (!vehiculo) throw new NotFoundException(`Vehiculo ${id} no encontrado`);
    return vehiculo;
  }

  async create(dto: CreateVehiculoDto) {
    const existentePorNumero = await this.vehiculoRepo.findOne({
      where: { numeroInterno: dto.numeroInterno },
    });
    if (existentePorNumero) {
      throw new ConflictException(`Ya existe un vehiculo con el numero interno "${dto.numeroInterno}"`);
    }

    if (dto.patente) {
      const existentePorPatente = await this.vehiculoRepo.findOne({ where: { patente: dto.patente } });
      if (existentePorPatente) {
        throw new ConflictException(`Ya existe un vehiculo con la patente "${dto.patente}"`);
      }
    }

    return this.vehiculoRepo.save(
      this.vehiculoRepo.create({
        ...dto,
        kilometrajeActual: dto.kilometrajeActual ?? 0,
        combustibleActual: dto.combustibleActual ?? 0,
        estado: dto.estado ?? 'OPERATIVO',
      } as unknown as Vehiculo),
    );
  }

  async update(id: string, dto: UpdateVehiculoDto) {
    await this.findOne(id);

    if (dto.numeroInterno !== undefined) {
      const existente = await this.vehiculoRepo.findOne({ where: { numeroInterno: dto.numeroInterno } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un vehiculo con el numero interno "${dto.numeroInterno}"`);
      }
    }

    if (dto.patente !== undefined && dto.patente !== null) {
      const existente = await this.vehiculoRepo.findOne({ where: { patente: dto.patente } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un vehiculo con la patente "${dto.patente}"`);
      }
    }

    await this.vehiculoRepo.update(id, { ...dto } as Partial<Vehiculo>);
    return this.findOne(id);
  }
}
