import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoBombero } from '../../shared/entities';
import { CreateTipoBomberoDto } from './dto/create-tipo-bombero.dto';
import { UpdateTipoBomberoDto } from './dto/update-tipo-bombero.dto';

@Injectable()
export class TiposBomberoService {
  constructor(
    @InjectRepository(TipoBombero) private readonly tipoBomberoRepo: Repository<TipoBombero>,
  ) {}

  findAll(q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.tipoBomberoRepo.createQueryBuilder('tb');

    if (!incluirEliminados) {
      query.andWhere('tb.eliminadoEn IS NULL');
    }

    if (q) {
      query.andWhere('(tb.nombre LIKE :q OR tb.prefijo LIKE :q)', { q: `%${q}%` });
    }

    if (estado) {
      query.andWhere('tb.estado = :estado', { estado });
    }

    query.orderBy('tb.orden', 'ASC').addOrderBy('tb.nombre', 'ASC');

    return query.getMany();
  }

  async findOne(id: string) {
    const tipoBombero = await this.tipoBomberoRepo.findOne({ where: { id } });
    if (!tipoBombero) throw new NotFoundException(`Tipo de bombero ${id} no encontrado`);
    return tipoBombero;
  }

  async create(dto: CreateTipoBomberoDto, actorId: string) {
    const existentePorNombre = await this.tipoBomberoRepo.findOne({ where: { nombre: dto.nombre } });
    if (existentePorNombre) {
      throw new ConflictException(`Ya existe un tipo de bombero llamado "${dto.nombre}"`);
    }

    const existentePorPrefijo = await this.tipoBomberoRepo.findOne({ where: { prefijo: dto.prefijo } });
    if (existentePorPrefijo) {
      throw new ConflictException(`Ya existe un tipo de bombero con el prefijo "${dto.prefijo}"`);
    }

    return this.tipoBomberoRepo.save(
      this.tipoBomberoRepo.create({
        nombre: dto.nombre,
        prefijo: dto.prefijo,
        descripcion: dto.descripcion ?? null,
        orden: dto.orden ?? 0,
        estado: dto.estado ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateTipoBomberoDto, actorId: string) {
    await this.findOne(id);

    if (dto.nombre !== undefined) {
      const existentePorNombre = await this.tipoBomberoRepo.findOne({ where: { nombre: dto.nombre } });
      if (existentePorNombre && existentePorNombre.id !== id) {
        throw new ConflictException(`Ya existe un tipo de bombero llamado "${dto.nombre}"`);
      }
    }

    if (dto.prefijo !== undefined) {
      const existentePorPrefijo = await this.tipoBomberoRepo.findOne({ where: { prefijo: dto.prefijo } });
      if (existentePorPrefijo && existentePorPrefijo.id !== id) {
        throw new ConflictException(`Ya existe un tipo de bombero con el prefijo "${dto.prefijo}"`);
      }
    }

    await this.tipoBomberoRepo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.prefijo !== undefined ? { prefijo: dto.prefijo } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.orden !== undefined ? { orden: dto.orden } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.tipoBomberoRepo.update(id, {
      estado: 'INACTIVO',
      eliminadoEn: new Date(),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.tipoBomberoRepo.update(id, {
      estado: 'ACTIVO',
      eliminadoEn: null,
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll(undefined, undefined, false);
    return filas.map((tb) => ({
      Prefijo: tb.prefijo,
      Nombre: tb.nombre,
      Descripcion: tb.descripcion ?? '',
      Orden: tb.orden,
      Estado: tb.estado,
      CreadoEn: tb.creadoEn,
      ActualizadoEn: tb.actualizadoEn,
    }));
  }
}
