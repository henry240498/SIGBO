import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EsquemaHorarioGuardia } from '../../shared/entities';
import { CreateEsquemaHorarioDto } from './dto/create-esquema-horario.dto';
import { UpdateEsquemaHorarioDto } from './dto/update-esquema-horario.dto';

@Injectable()
export class EsquemasHorarioService {
  constructor(@InjectRepository(EsquemaHorarioGuardia) private readonly repo: Repository<EsquemaHorarioGuardia>) {}

  findAll(soloActivos?: boolean) {
    return this.repo.find({
      where: soloActivos ? { activo: true } : undefined,
      order: { orden: 'ASC' },
    });
  }

  async findOne(id: string) {
    const esquema = await this.repo.findOne({ where: { id } });
    if (!esquema) throw new NotFoundException(`Esquema de horario ${id} no encontrado`);
    return esquema;
  }

  create(dto: CreateEsquemaHorarioDto) {
    return this.repo.save(
      this.repo.create({
        nombre: dto.nombre,
        diasSemanaCsv: dto.diasSemanaCsv ?? null,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        cruzaMedianoche: dto.cruzaMedianoche ?? false,
        diasDuracion: dto.diasDuracion ?? 1,
        esEspecial: dto.esEspecial ?? false,
        usaRotacionGrupo: dto.usaRotacionGrupo ?? false,
        requiereOficial: dto.requiereOficial ?? true,
        requiereChofer: dto.requiereChofer ?? true,
        cantidadMinima: dto.cantidadMinima ?? null,
        cantidadMaxima: dto.cantidadMaxima ?? null,
        cantidadOficiales: dto.cantidadOficiales ?? 1,
        cantidadChoferes: dto.cantidadChoferes ?? 1,
        orden: dto.orden ?? 0,
        activo: dto.activo ?? true,
      }),
    );
  }

  async update(id: string, dto: UpdateEsquemaHorarioDto) {
    await this.findOne(id);
    await this.repo.update(id, { ...dto } as Partial<EsquemaHorarioGuardia>);
    return this.findOne(id);
  }

  async remove(id: string) {
    const esquema = await this.findOne(id);
    await this.repo.remove(esquema);
    return { eliminado: true };
  }
}
