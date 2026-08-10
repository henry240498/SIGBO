import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAuditoria } from '../../shared/entities';

export interface RegistrarAuditoriaInput {
  usuarioId: string | null;
  accion: string;
  recurso: string;
  recursoId?: string | null;
  datosAntes?: unknown;
  datosDespues?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
}

export interface FiltrosAuditoria {
  usuarioId?: string;
  recurso?: string;
  /** Filtra por prefijo de recurso (ej. 'operaciones.' trae todos los
   * recursos de ese modulo sin tener que enumerarlos uno por uno). */
  recursoPrefijo?: string;
  recursoId?: string;
  accion?: string;
  desde?: Date;
  hasta?: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(LogAuditoria) private readonly logRepo: Repository<LogAuditoria>,
  ) {}

  async registrar(input: RegistrarAuditoriaInput): Promise<void> {
    await this.logRepo.save(
      this.logRepo.create({
        usuarioId: input.usuarioId,
        accion: input.accion,
        recurso: input.recurso,
        recursoId: input.recursoId ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        datosAntes: input.datosAntes !== undefined ? JSON.stringify(input.datosAntes) : null,
        datosDespues: input.datosDespues !== undefined ? JSON.stringify(input.datosDespues) : null,
        metadata: input.metadata !== undefined ? JSON.stringify(input.metadata) : null,
      }),
    );
  }

  async findAll(filtros: FiltrosAuditoria) {
    const page = filtros.page && filtros.page > 0 ? filtros.page : 1;
    const pageSize = filtros.pageSize && filtros.pageSize > 0 ? Math.min(filtros.pageSize, 100) : 25;

    const qb = this.logRepo.createQueryBuilder('l').orderBy('l.fecha', 'DESC');

    if (filtros.usuarioId) qb.andWhere('l.usuarioId = :usuarioId', { usuarioId: filtros.usuarioId });
    if (filtros.recurso) qb.andWhere('l.recurso = :recurso', { recurso: filtros.recurso });
    if (filtros.recursoPrefijo) qb.andWhere('l.recurso LIKE :recursoPrefijo', { recursoPrefijo: `${filtros.recursoPrefijo}%` });
    if (filtros.recursoId) qb.andWhere('l.recursoId = :recursoId', { recursoId: filtros.recursoId });
    if (filtros.accion) qb.andWhere('l.accion = :accion', { accion: filtros.accion });
    if (filtros.desde) qb.andWhere('l.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('l.fecha <= :hasta', { hasta: filtros.hasta });

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }

  findRecientes(cantidad: number) {
    return this.logRepo.find({ order: { fecha: 'DESC' }, take: cantidad });
  }

  findPorUsuario(usuarioId: string, cantidad: number) {
    return this.logRepo.find({ where: { usuarioId }, order: { fecha: 'DESC' }, take: cantidad });
  }
}
