import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, BomberoEspecialidad, Especialidad } from '../../shared/entities';
import { EspecialidadAsignadaDto } from './dto/set-especialidades.dto';

@Injectable()
export class EspecialidadesBomberoService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(BomberoEspecialidad)
    private readonly bomberoEspecialidadRepo: Repository<BomberoEspecialidad>,
    @InjectRepository(Especialidad) private readonly especialidadRepo: Repository<Especialidad>,
  ) {}

  async listar(bomberoId: string) {
    const asignaciones = await this.bomberoEspecialidadRepo.find({ where: { bomberoId } });
    if (asignaciones.length === 0) return [];

    const ids = asignaciones.map((a) => a.especialidadId);
    const especialidades = await this.especialidadRepo
      .createQueryBuilder('e')
      .where('e.id IN (:...ids)', { ids })
      .getMany();
    const map = new Map(especialidades.map((e) => [e.id, e]));

    return asignaciones.map((a) => ({
      especialidadId: a.especialidadId,
      nombre: map.get(a.especialidadId)?.nombre ?? a.especialidadId,
      fechaObtencion: a.fechaObtencion,
      estado: a.estado,
      nivel: a.nivel,
      institucionCertificadora: a.institucionCertificadora,
      vigencia: a.vigencia,
    }));
  }

  async reemplazar(bomberoId: string, especialidades: EspecialidadAsignadaDto[]) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    await this.bomberoEspecialidadRepo.delete({ bomberoId });
    for (const item of especialidades) {
      await this.bomberoEspecialidadRepo.save(
        this.bomberoEspecialidadRepo.create({
          bomberoId,
          especialidadId: item.especialidadId,
          fechaObtencion: item.fechaObtencion ?? null,
          nivel: item.nivel ?? null,
          institucionCertificadora: item.institucionCertificadora ?? null,
          vigencia: item.vigencia ?? null,
        }),
      );
    }

    return this.listar(bomberoId);
  }
}
