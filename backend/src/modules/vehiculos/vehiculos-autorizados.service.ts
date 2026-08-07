import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo, VehiculoAutorizado } from '../../shared/entities';
import { VehiculoAutorizadoDto } from './dto/vehiculo-autorizado.dto';

@Injectable()
export class VehiculosAutorizadosService {
  constructor(
    @InjectRepository(VehiculoAutorizado)
    private readonly vehiculoAutorizadoRepo: Repository<VehiculoAutorizado>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
  ) {}

  async listar(bomberoId: string) {
    const asignaciones = await this.vehiculoAutorizadoRepo.find({ where: { bomberoId } });
    if (asignaciones.length === 0) return [];

    const ids = asignaciones.map((a) => a.vehiculoId);
    const vehiculos = await this.vehiculoRepo
      .createQueryBuilder('v')
      .where('v.id IN (:...ids)', { ids })
      .getMany();
    const map = new Map(vehiculos.map((v) => [v.id, v]));

    return asignaciones.map((a) => {
      const vehiculo = map.get(a.vehiculoId);
      return {
        id: a.id,
        vehiculoId: a.vehiculoId,
        numeroInterno: vehiculo?.numeroInterno ?? null,
        patente: vehiculo?.patente ?? null,
        marca: vehiculo?.marca ?? null,
        modelo: vehiculo?.modelo ?? null,
        categoria: a.categoria,
        fechaAutorizacion: a.fechaAutorizacion,
        vigencia: a.vigencia,
        capacitaciones: a.capacitaciones,
        creadoEn: a.creadoEn,
      };
    });
  }

  async reemplazar(bomberoId: string, vehiculos: VehiculoAutorizadoDto[]) {
    await this.vehiculoAutorizadoRepo.delete({ bomberoId });

    for (const item of vehiculos) {
      await this.vehiculoAutorizadoRepo.save(
        this.vehiculoAutorizadoRepo.create({
          bomberoId,
          vehiculoId: item.vehiculoId,
          categoria: item.categoria ?? null,
          fechaAutorizacion: item.fechaAutorizacion ?? null,
          vigencia: item.vigencia ?? null,
          capacitaciones: item.capacitaciones ?? null,
        }),
      );
    }

    return this.listar(bomberoId);
  }
}
