import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Cargo, Compania, Cuartel, Designacion } from '../../shared/entities';
import { CreateDesignacionDto } from './dto/create-designacion.dto';
import { UpdateDesignacionDto } from './dto/update-designacion.dto';
import { FinalizarDesignacionDto } from './dto/finalizar-designacion.dto';

export interface FiltrosDesignacion {
  bomberoId?: string;
  cargoId?: string;
  estado?: string;
  incluirEliminados?: boolean;
}

@Injectable()
export class DesignacionesService {
  constructor(
    @InjectRepository(Designacion) private readonly repo: Repository<Designacion>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Compania) private readonly companiaRepo: Repository<Compania>,
    @InjectRepository(Cuartel) private readonly cuartelRepo: Repository<Cuartel>,
  ) {}

  async findAll(filtros: FiltrosDesignacion = {}) {
    const qb = this.repo.createQueryBuilder('d').orderBy('d.fechaDesde', 'DESC');
    if (!filtros.incluirEliminados) qb.andWhere('d.eliminadoEn IS NULL');
    if (filtros.bomberoId) qb.andWhere('d.bomberoId = :bomberoId', { bomberoId: filtros.bomberoId });
    if (filtros.cargoId) qb.andWhere('d.cargoId = :cargoId', { cargoId: filtros.cargoId });
    if (filtros.estado) qb.andWhere('d.estado = :estado', { estado: filtros.estado });

    const designaciones = await qb.getMany();
    return this.resolverNombres(designaciones);
  }

  async findOne(id: string) {
    const designacion = await this.repo.findOne({ where: { id } });
    if (!designacion) throw new NotFoundException(`Designacion ${id} no encontrada`);
    const [resuelta] = await this.resolverNombres([designacion]);
    return resuelta;
  }

  private async resolverNombres(designaciones: Designacion[]) {
    if (designaciones.length === 0) return [];

    const bomberoIds = [...new Set(designaciones.map((d) => d.bomberoId))];
    const cargoIds = [...new Set(designaciones.map((d) => d.cargoId))];
    const companiaIds = [...new Set(designaciones.map((d) => d.companiaId).filter((x): x is string => !!x))];
    const cuartelIds = [...new Set(designaciones.map((d) => d.cuartelId).filter((x): x is string => !!x))];

    const [bomberos, cargos, companias, cuarteles] = await Promise.all([
      bomberoIds.length ? this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany() : [],
      cargoIds.length ? this.cargoRepo.createQueryBuilder('c').where('c.id IN (:...ids)', { ids: cargoIds }).getMany() : [],
      companiaIds.length ? this.companiaRepo.createQueryBuilder('c').where('c.id IN (:...ids)', { ids: companiaIds }).getMany() : [],
      cuartelIds.length ? this.cuartelRepo.createQueryBuilder('c').where('c.id IN (:...ids)', { ids: cuartelIds }).getMany() : [],
    ]);

    const bomberoMap = new Map<string, string>(
      bomberos.map((b): [string, string] => [b.id, `${b.nombre} ${b.apellido}`]),
    );
    const cargoMap = new Map<string, string>(cargos.map((c): [string, string] => [c.id, c.nombre]));
    const companiaMap = new Map<string, string>(companias.map((c): [string, string] => [c.id, c.nombre]));
    const cuartelMap = new Map<string, string>(cuarteles.map((c): [string, string] => [c.id, c.nombre]));

    return designaciones.map((d) => ({
      ...d,
      bomberoNombre: bomberoMap.get(d.bomberoId) ?? null,
      cargoNombre: cargoMap.get(d.cargoId) ?? null,
      companiaNombre: d.companiaId ? companiaMap.get(d.companiaId) ?? null : null,
      cuartelNombre: d.cuartelId ? cuartelMap.get(d.cuartelId) ?? null : null,
    }));
  }

  async create(dto: CreateDesignacionDto, actorId: string) {
    const conflicto = await this.repo.findOne({
      where: {
        bomberoId: dto.bomberoId,
        cargoId: dto.cargoId,
        estado: 'ACTIVA',
      },
    });
    if (conflicto) {
      throw new ConflictException(
        'Este bombero ya tiene una designacion ACTIVA para este cargo. Finalizala antes de crear una nueva.',
      );
    }

    const designacion = await this.repo.save(
      this.repo.create({
        ...dto,
        companiaId: dto.companiaId ?? null,
        cuartelId: dto.cuartelId ?? null,
        fechaHasta: dto.fechaHasta ?? null,
        estado: 'ACTIVA',
        creadoPor: actorId,
      }),
    );
    return this.findOne(designacion.id);
  }

  async update(id: string, dto: UpdateDesignacionDto, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, { ...dto, actualizadoPor: actorId } as any);
    return this.findOne(id);
  }

  async finalizar(id: string, dto: FinalizarDesignacionDto, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, {
      estado: 'FINALIZADA',
      fechaHasta: dto.fechaHasta ?? new Date().toISOString().slice(0, 10),
      actualizadoPor: actorId,
    });
    return this.findOne(id);
  }

  async darBaja(id: string, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, { estado: 'ANULADA', eliminadoEn: new Date(), actualizadoPor: actorId });
    return this.findOne(id);
  }

  async reactivar(id: string, actorId: string) {
    await this.findOne(id);
    await this.repo.update(id, { estado: 'ACTIVA', eliminadoEn: null, actualizadoPor: actorId });
    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll();
    return filas.map((f) => ({
      codigo: f.codigo,
      bombero: f.bomberoNombre,
      cargo: f.cargoNombre,
      compania: f.companiaNombre,
      cuartel: f.cuartelNombre,
      fechaDesde: f.fechaDesde,
      fechaHasta: f.fechaHasta,
      estado: f.estado,
      motivo: f.motivo,
    }));
  }
}
