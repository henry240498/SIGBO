import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEquipo } from '../../shared/entities';
import { CreateCategoriaEquipoDto } from './dto/create-categoria-equipo.dto';
import { UpdateCategoriaEquipoDto } from './dto/update-categoria-equipo.dto';

@Injectable()
export class CategoriasEquipoService {
  constructor(
    @InjectRepository(CategoriaEquipo)
    private readonly categoriaRepo: Repository<CategoriaEquipo>,
  ) {}

  findAll(q?: string, activo?: string) {
    const qb = this.categoriaRepo.createQueryBuilder('c');

    if (q) {
      qb.andWhere('c.nombre LIKE :q', { q: `%${q}%` });
    }

    if (activo !== undefined) {
      qb.andWhere('c.activo = :activo', { activo: activo === 'true' });
    }

    qb.orderBy('c.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const categoria = await this.categoriaRepo.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException(`Categoria de equipo ${id} no encontrada`);
    return categoria;
  }

  async create(dto: CreateCategoriaEquipoDto) {
    if (dto.padreId) {
      await this.findOne(dto.padreId);
    }

    return this.categoriaRepo.save(
      this.categoriaRepo.create({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        padreId: dto.padreId ?? null,
        activo: dto.activo ?? true,
      }),
    );
  }

  async update(id: string, dto: UpdateCategoriaEquipoDto) {
    await this.findOne(id);

    if (dto.padreId) {
      if (dto.padreId === id) {
        throw new ConflictException('Una categoria no puede ser su propia categoria padre');
      }
      await this.findOne(dto.padreId);
    }

    await this.categoriaRepo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.padreId !== undefined ? { padreId: dto.padreId } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const categoria = await this.findOne(id);
    await this.categoriaRepo.remove(categoria);
    return { eliminado: true };
  }
}
