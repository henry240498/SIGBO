import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoGuardia } from '../../shared/entities';
import { CreateTipoGuardiaDto } from './dto/create-tipo-guardia.dto';
import { UpdateTipoGuardiaDto } from './dto/update-tipo-guardia.dto';

@Injectable()
export class TiposGuardiaService {
  constructor(
    @InjectRepository(TipoGuardia) private readonly tipoGuardiaRepo: Repository<TipoGuardia>,
  ) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.tipoGuardiaRepo.createQueryBuilder('tg');

    if (!incluirEliminados) {
      query.andWhere('tg.eliminadoEn IS NULL');
    }

    if (q) {
      query.andWhere('(tg.nombre LIKE :q OR tg.codigo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      query.andWhere('tg.estado = :estado', { estado });
    }

    query.orderBy('tg.nombre', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const tipoGuardia = await this.tipoGuardiaRepo.findOne({ where: { id } });
    if (!tipoGuardia) throw new NotFoundException(`Tipo de guardia ${id} no encontrado`);
    return tipoGuardia;
  }

  async create(dto: CreateTipoGuardiaDto, actorId: string) {
    const existentePorCodigo = await this.tipoGuardiaRepo.findOne({ where: { codigo: dto.codigo } });
    if (existentePorCodigo) {
      throw new ConflictException(`Ya existe un tipo de guardia con codigo "${dto.codigo}"`);
    }

    const existentePorNombre = await this.tipoGuardiaRepo.findOne({ where: { nombre: dto.nombre } });
    if (existentePorNombre) {
      throw new ConflictException(`Ya existe un tipo de guardia llamado "${dto.nombre}"`);
    }

    return this.tipoGuardiaRepo.save(
      this.tipoGuardiaRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        duracionHoras: dto.duracionHoras ?? null,
        descripcion: dto.descripcion ?? null,
        estado: dto.estado ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateTipoGuardiaDto, actorId: string) {
    await this.findOne(id);

    if (dto.codigo !== undefined) {
      const existentePorCodigo = await this.tipoGuardiaRepo.findOne({ where: { codigo: dto.codigo } });
      if (existentePorCodigo && existentePorCodigo.id !== id) {
        throw new ConflictException(`Ya existe un tipo de guardia con codigo "${dto.codigo}"`);
      }
    }

    if (dto.nombre !== undefined) {
      const existentePorNombre = await this.tipoGuardiaRepo.findOne({ where: { nombre: dto.nombre } });
      if (existentePorNombre && existentePorNombre.id !== id) {
        throw new ConflictException(`Ya existe un tipo de guardia llamado "${dto.nombre}"`);
      }
    }

    await this.tipoGuardiaRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.duracionHoras !== undefined ? { duracionHoras: dto.duracionHoras } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.tipoGuardiaRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.tipoGuardiaRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll(undefined, undefined, false);
    return filas.map((tg) => ({
      codigo: tg.codigo,
      nombre: tg.nombre,
      duracionHoras: tg.duracionHoras,
      descripcion: tg.descripcion,
      estado: tg.estado,
      creadoEn: tg.creadoEn,
      actualizadoEn: tg.actualizadoEn,
    }));
  }
}
