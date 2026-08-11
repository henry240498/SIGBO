import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo, PrestamoEquipo } from '../../shared/entities';
import { CrearPrestamoDto, DevolucionDto } from './dto/prestamo-equipo-bombero.dto';

@Injectable()
export class EquipamientoBomberoService {
  constructor(
    @InjectRepository(PrestamoEquipo)
    private readonly prestamoRepo: Repository<PrestamoEquipo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
  ) {}

  async historial(bomberoId: string) {
    const prestamos = await this.prestamoRepo.find({
      where: { bomberoId },
      order: { fechaPrestamo: 'DESC' },
    });
    if (prestamos.length === 0) return [];

    const equipoIds = [...new Set(prestamos.map((p) => p.equipoId))];
    const equipos = await this.equipoRepo
      .createQueryBuilder('e')
      .where('e.id IN (:...equipoIds)', { equipoIds })
      .getMany();
    const map = new Map(equipos.map((e) => [e.id, e]));

    return prestamos.map((p) => ({
      ...p,
      equipoNombre: map.get(p.equipoId)?.nombre ?? null,
      equipoCodigoInterno: map.get(p.equipoId)?.codigoInterno ?? null,
    }));
  }

  async prestar(bomberoId: string, dto: CrearPrestamoDto, creadoPor: string) {
    const equipo = await this.equipoRepo.findOne({ where: { id: dto.equipoId } });
    if (!equipo) throw new NotFoundException(`Equipo ${dto.equipoId} no encontrado`);

    return this.prestamoRepo.save(
      this.prestamoRepo.create({
        bomberoId,
        equipoId: dto.equipoId,
        fechaPrestamo: new Date(),
        fechaDevolucionComprometida: dto.fechaDevolucionComprometida ? new Date(dto.fechaDevolucionComprometida) : null,
        estado: 'PRESTADO',
        observaciones: dto.observaciones ?? null,
        creadoPor,
      }),
    );
  }

  async devolver(prestamoId: string, dto: DevolucionDto) {
    const prestamo = await this.prestamoRepo.findOne({ where: { id: prestamoId } });
    if (!prestamo) throw new NotFoundException(`Prestamo ${prestamoId} no encontrado`);

    await this.prestamoRepo.update(prestamoId, {
      fechaDevolucion: new Date(),
      estado: 'DEVUELTO',
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
    });

    return this.prestamoRepo.findOne({ where: { id: prestamoId } });
  }
}
