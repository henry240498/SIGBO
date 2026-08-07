import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ascenso, Bombero, Rango } from '../../shared/entities';
import { CreateAscensoDto } from './dto/create-ascenso.dto';

export interface FiltrosAscenso {
  bomberoId?: string;
  incluirEliminados?: boolean;
}

@Injectable()
export class AscensosService {
  constructor(
    @InjectRepository(Ascenso) private readonly repo: Repository<Ascenso>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
  ) {}

  async findAll(filtros: FiltrosAscenso = {}) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.fecha', 'DESC');
    if (!filtros.incluirEliminados) qb.andWhere('a.eliminadoEn IS NULL');
    if (filtros.bomberoId) qb.andWhere('a.bomberoId = :bomberoId', { bomberoId: filtros.bomberoId });

    const ascensos = await qb.getMany();
    return this.resolverNombres(ascensos);
  }

  async findOne(id: string) {
    const ascenso = await this.repo.findOne({ where: { id } });
    if (!ascenso) throw new NotFoundException(`Ascenso ${id} no encontrado`);
    const [resuelto] = await this.resolverNombres([ascenso]);
    return resuelto;
  }

  private async resolverNombres(ascensos: Ascenso[]) {
    if (ascensos.length === 0) return [];

    const bomberoIds = [...new Set(ascensos.map((a) => a.bomberoId))];
    const rangoIds = [
      ...new Set(
        ascensos.flatMap((a) => [a.rangoAnteriorId, a.rangoNuevoId]).filter((x): x is string => !!x),
      ),
    ];

    const [bomberos, rangos] = await Promise.all([
      bomberoIds.length
        ? this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
        : [],
      rangoIds.length
        ? this.rangoRepo.createQueryBuilder('r').where('r.id IN (:...ids)', { ids: rangoIds }).getMany()
        : [],
    ]);

    const bomberoMap = new Map<string, string>(
      bomberos.map((b): [string, string] => [b.id, `${b.nombre} ${b.apellido}`]),
    );
    const rangoMap = new Map<string, string>(rangos.map((r): [string, string] => [r.id, r.nombre]));

    return ascensos.map((a) => ({
      ...a,
      bomberoNombre: bomberoMap.get(a.bomberoId) ?? null,
      rangoAnteriorNombre: a.rangoAnteriorId ? rangoMap.get(a.rangoAnteriorId) ?? null : null,
      rangoNuevoNombre: rangoMap.get(a.rangoNuevoId) ?? null,
    }));
  }

  async create(dto: CreateAscensoDto, actorId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);

    const rangoNuevo = await this.rangoRepo.findOne({ where: { id: dto.rangoNuevoId } });
    if (!rangoNuevo) throw new NotFoundException(`Rango ${dto.rangoNuevoId} no encontrado`);

    if (bombero.rangoId === dto.rangoNuevoId) {
      throw new BadRequestException('El bombero ya tiene ese rango actualmente');
    }

    const ascenso = await this.repo.save(
      this.repo.create({
        bomberoId: dto.bomberoId,
        rangoAnteriorId: bombero.rangoId,
        rangoNuevoId: dto.rangoNuevoId,
        fecha: dto.fecha,
        resolucion: dto.resolucion ?? null,
        motivo: dto.motivo ?? null,
        observaciones: dto.observaciones ?? null,
        estado: 'REGISTRADO',
        creadoPor: actorId,
      }),
    );

    await this.bomberoRepo.update(bombero.id, {
      rangoId: rangoNuevo.id,
      rango: rangoNuevo.nombre,
      fechaAscenso: dto.fecha,
      actualizadoPor: actorId,
    });

    return this.findOne(ascenso.id);
  }

  async anular(id: string, actorId: string) {
    const ascenso = await this.repo.findOne({ where: { id } });
    if (!ascenso) throw new NotFoundException(`Ascenso ${id} no encontrado`);
    if (ascenso.estado === 'ANULADO') return this.findOne(id);

    await this.repo.update(id, { estado: 'ANULADO', eliminadoEn: new Date(), actualizadoPor: actorId });

    const bombero = await this.bomberoRepo.findOne({ where: { id: ascenso.bomberoId } });
    if (bombero && bombero.rangoId === ascenso.rangoNuevoId) {
      let nombreAnterior = '';
      if (ascenso.rangoAnteriorId) {
        const rangoAnterior = await this.rangoRepo.findOne({ where: { id: ascenso.rangoAnteriorId } });
        nombreAnterior = rangoAnterior?.nombre ?? '';
      }
      await this.bomberoRepo.update(bombero.id, {
        rangoId: ascenso.rangoAnteriorId,
        rango: nombreAnterior,
        actualizadoPor: actorId,
      });
    }

    return this.findOne(id);
  }

  async filasExportables() {
    const filas = await this.findAll();
    return filas.map((f) => ({
      codigo: f.codigo,
      bombero: f.bomberoNombre,
      rangoAnterior: f.rangoAnteriorNombre,
      rangoNuevo: f.rangoNuevoNombre,
      fecha: f.fecha,
      resolucion: f.resolucion,
      estado: f.estado,
    }));
  }
}
