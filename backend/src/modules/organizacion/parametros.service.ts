import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parametro } from '../../shared/entities';
import { normalizarTexto } from '../../shared/utils/normalizar-texto';
import { CreateParametroDto } from './dto/create-parametro.dto';
import { UpdateParametroDto } from './dto/update-parametro.dto';

@Injectable()
export class ParametrosService {
  constructor(@InjectRepository(Parametro) private readonly repo: Repository<Parametro>) {}

  findAll(tipo?: string, padreId?: string, q?: string, estado?: string, incluirEliminados?: boolean) {
    const query = this.repo.createQueryBuilder('p');

    if (!incluirEliminados) {
      query.andWhere('p.eliminadoEn IS NULL');
    }
    if (tipo) {
      query.andWhere('p.tipo = :tipo', { tipo });
    }
    if (padreId !== undefined) {
      if (padreId === '') {
        query.andWhere('p.padreId IS NULL');
      } else {
        query.andWhere('p.padreId = :padreId', { padreId });
      }
    }
    if (q) {
      query.andWhere('p.nombre LIKE :q', { q: `%${q}%` });
    }
    if (estado) {
      query.andWhere('p.estado = :estado', { estado });
    }

    query.orderBy('p.orden', 'ASC').addOrderBy('p.nombre', 'ASC');
    return query.getMany();
  }

  async findOne(id: string) {
    const parametro = await this.repo.findOne({ where: { id } });
    if (!parametro) throw new NotFoundException(`Parametro ${id} no encontrado`);
    return parametro;
  }

  private async verificarDuplicado(
    tipo: string,
    nombreNormalizado: string,
    padreId: string | null,
    idExcluido?: string,
  ) {
    const query = this.repo
      .createQueryBuilder('p')
      .where('p.tipo = :tipo', { tipo })
      .andWhere('p.nombreNormalizado = :nombreNormalizado', { nombreNormalizado });
    query.andWhere(padreId ? 'p.padreId = :padreId' : 'p.padreId IS NULL', padreId ? { padreId } : {});
    if (idExcluido) {
      query.andWhere('p.id <> :idExcluido', { idExcluido });
    }
    const existente = await query.getOne();
    if (existente) {
      throw new ConflictException(
        `Ya existe un parametro de tipo ${tipo} equivalente a "${existente.nombre}" (revisar mayusculas/tildes/espacios).`,
      );
    }
  }

  async create(dto: CreateParametroDto, actorId: string) {
    const nombreNormalizado = normalizarTexto(dto.nombre);
    await this.verificarDuplicado(dto.tipo, nombreNormalizado, dto.padreId ?? null);

    return this.repo.save(
      this.repo.create({
        tipo: dto.tipo as any,
        padreId: dto.padreId ?? null,
        nombre: dto.nombre,
        nombreNormalizado,
        codigo: dto.codigo ?? null,
        descripcion: dto.descripcion ?? null,
        orden: dto.orden ?? 0,
        estado: (dto.estado as any) ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );
  }

  async update(id: string, dto: UpdateParametroDto, actorId: string) {
    const actual = await this.findOne(id);

    const tipo = dto.tipo ?? actual.tipo;
    const padreId = dto.padreId !== undefined ? dto.padreId : actual.padreId;
    const nombreNormalizado = dto.nombre !== undefined ? normalizarTexto(dto.nombre) : actual.nombreNormalizado;

    if (dto.nombre !== undefined || dto.tipo !== undefined || dto.padreId !== undefined) {
      await this.verificarDuplicado(tipo, nombreNormalizado, padreId ?? null, id);
    }

    await this.repo.update(id, {
      ...(dto.tipo !== undefined ? { tipo: dto.tipo as any } : {}),
      ...(dto.padreId !== undefined ? { padreId: dto.padreId } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre, nombreNormalizado } : {}),
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.orden !== undefined ? { orden: dto.orden } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      actualizadoPor: actorId,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, { estado: 'INACTIVO', eliminadoEn: new Date(), actualizadoPor: actorId });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, { estado: 'ACTIVO', eliminadoEn: null, actualizadoPor: actorId });
    return this.findOne(id);
  }

  async filasExportables(tipo?: string) {
    const filas = await this.findAll(tipo, undefined, undefined, undefined, false);
    return filas.map((p) => ({
      Tipo: p.tipo,
      Nombre: p.nombre,
      Codigo: p.codigo ?? '',
      Descripcion: p.descripcion ?? '',
      Orden: p.orden,
      Estado: p.estado,
    }));
  }
}
