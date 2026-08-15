import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaArticulo } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateCategoriaArticuloDto, UpdateCategoriaArticuloDto } from './dto/categoria-articulo.dto';

@Injectable()
export class CategoriasArticuloService {
  constructor(
    @InjectRepository(CategoriaArticulo) private readonly categoriaRepo: Repository<CategoriaArticulo>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(q?: string, activo?: string) {
    const qb = this.categoriaRepo.createQueryBuilder('c');
    if (q) qb.andWhere('(c.nombre LIKE :q OR c.codigo LIKE :q)', { q: `%${q}%` });
    if (activo !== undefined) qb.andWhere('c.activo = :activo', { activo: activo === 'true' });
    qb.orderBy('c.nombre', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const categoria = await this.categoriaRepo.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException(`Categoria de articulo ${id} no encontrada`);
    return categoria;
  }

  async create(dto: CreateCategoriaArticuloDto, actorId: string, ip?: string) {
    if (dto.padreId) await this.findOne(dto.padreId);
    const categoria = await this.categoriaRepo.save(
      this.categoriaRepo.create({
        codigo: dto.codigo ?? null,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        padreId: dto.padreId ?? null,
        activo: dto.activo ?? true,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.categorias_articulo',
      recursoId: categoria.id,
      datosDespues: categoria,
      ip: ip ?? null,
    });
    return categoria;
  }

  async update(id: string, dto: UpdateCategoriaArticuloDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    if (dto.padreId) {
      if (dto.padreId === id) throw new ConflictException('Una categoria no puede ser su propia categoria padre');
      await this.findOne(dto.padreId);
    }
    await this.categoriaRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.padreId !== undefined ? { padreId: dto.padreId } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'deposito.categorias_articulo',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }

  async remove(id: string, actorId: string, ip?: string) {
    const categoria = await this.findOne(id);
    await this.categoriaRepo.remove(categoria);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ELIMINAR',
      recurso: 'deposito.categorias_articulo',
      recursoId: id,
      datosAntes: categoria,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
