import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidenciaDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateIncidenciaDepositoDto, ResolverIncidenciaDto } from './dto/incidencia-deposito.dto';

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(IncidenciaDeposito) private readonly incidenciaRepo: Repository<IncidenciaDeposito>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { estado?: string; origenTipo?: string; gravedad?: string }) {
    const qb = this.incidenciaRepo.createQueryBuilder('i').orderBy('i.fechaApertura', 'DESC');
    if (filtros.estado) qb.andWhere('i.estado = :estado', { estado: filtros.estado });
    if (filtros.origenTipo) qb.andWhere('i.origenTipo = :origenTipo', { origenTipo: filtros.origenTipo });
    if (filtros.gravedad) qb.andWhere('i.gravedad = :gravedad', { gravedad: filtros.gravedad });
    return qb.getMany();
  }

  async findOne(id: string) {
    const incidencia = await this.incidenciaRepo.findOne({ where: { id } });
    if (!incidencia) throw new NotFoundException(`Incidencia ${id} no encontrada`);
    return incidencia;
  }

  async create(dto: CreateIncidenciaDepositoDto, actorId: string) {
    return this.incidenciaRepo.save(
      this.incidenciaRepo.create({
        origenTipo: 'MANUAL',
        tipoElemento: (dto.tipoElemento as any) ?? null,
        articuloId: dto.articuloId ?? null,
        equipoId: dto.equipoId ?? null,
        vehiculoId: dto.vehiculoId ?? null,
        descripcion: dto.descripcion,
        gravedad: (dto.gravedad as any) ?? 'MEDIA',
        fechaApertura: new Date(),
        reportadoPor: actorId,
      }),
    );
  }

  async resolver(id: string, dto: ResolverIncidenciaDto, actorId: string, ip?: string) {
    const incidencia = await this.findOne(id);
    if (incidencia.estado === 'RESUELTA' || incidencia.estado === 'DESCARTADA') {
      throw new BadRequestException('Esta incidencia ya fue cerrada');
    }
    await this.incidenciaRepo.update(id, {
      estado: (dto.estado as any) ?? 'RESUELTA',
      resolucion: dto.resolucion,
      resueltoPor: actorId,
      fechaResolucion: new Date(),
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'RESOLVER',
      recurso: 'deposito.incidencias',
      recursoId: id,
      datosAntes: incidencia,
      ip: ip ?? null,
    });

    return this.findOne(id);
  }
}
