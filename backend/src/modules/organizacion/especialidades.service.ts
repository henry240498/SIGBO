import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from '../../shared/entities';
import { CreateEspecialidadDto } from './dto/create-especialidade.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidade.dto';

@Injectable()
export class EspecialidadesService {
  constructor(
    @InjectRepository(Especialidad) private readonly especialidadRepo: Repository<Especialidad>,
  ) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.especialidadRepo.createQueryBuilder('especialidad');

    if (!incluirEliminados) {
      query.andWhere('especialidad.eliminadoEn IS NULL');
    }

    if (q) {
      query.andWhere('(especialidad.nombre LIKE :q OR especialidad.codigo LIKE :q)', {
        q: `%${q}%`,
      });
    }

    if (estado) {
      query.andWhere('especialidad.estado = :estado', { estado });
    }

    query.orderBy('especialidad.nombre', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const especialidad = await this.especialidadRepo.findOne({ where: { id } });
    if (!especialidad) throw new NotFoundException(`Especialidad ${id} no encontrada`);
    return especialidad;
  }

  async create(dto: CreateEspecialidadDto, actorId: string) {
    const porCodigo = await this.especialidadRepo.findOne({ where: { codigo: dto.codigo } });
    if (porCodigo) {
      throw new ConflictException(`Ya existe una especialidad con el codigo "${dto.codigo}"`);
    }

    const porNombre = await this.especialidadRepo.findOne({ where: { nombre: dto.nombre } });
    if (porNombre) {
      throw new ConflictException(`Ya existe una especialidad llamada "${dto.nombre}"`);
    }

    const especialidad = this.especialidadRepo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      requisitos: dto.requisitos ?? null,
      estado: dto.estado ?? 'ACTIVO',
      creadoPor: actorId,
    });

    return this.especialidadRepo.save(especialidad);
  }

  async update(id: string, dto: UpdateEspecialidadDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const porCodigo = await this.especialidadRepo.findOne({ where: { codigo: dto.codigo } });
      if (porCodigo && porCodigo.id !== id) {
        throw new ConflictException(`Ya existe una especialidad con el codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const porNombre = await this.especialidadRepo.findOne({ where: { nombre: dto.nombre } });
      if (porNombre && porNombre.id !== id) {
        throw new ConflictException(`Ya existe una especialidad llamada "${dto.nombre}"`);
      }
    }

    await this.especialidadRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.requisitos !== undefined ? { requisitos: dto.requisitos } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.especialidadRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.especialidadRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll();
    return filas.map((f) => ({
      codigo: f.codigo,
      nombre: f.nombre,
      descripcion: f.descripcion,
      requisitos: f.requisitos,
      estado: f.estado,
      creadoEn: f.creadoEn,
      actualizadoEn: f.actualizadoEn,
    }));
  }
}
