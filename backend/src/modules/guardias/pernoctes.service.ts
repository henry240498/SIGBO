import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Pernocte } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreatePernocteDto } from './dto/create-pernocte.dto';

@Injectable()
export class PernoctesService {
  constructor(
    @InjectRepository(Pernocte) private readonly pernocteRepo: Repository<Pernocte>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async listar(fecha?: string, guardiaId?: string) {
    const query = this.pernocteRepo.createQueryBuilder('p').orderBy('p.fecha', 'DESC');
    if (fecha) query.andWhere('p.fecha = :fecha', { fecha });
    if (guardiaId) query.andWhere('p.guardiaId = :guardiaId', { guardiaId });
    const pernoctes = await query.getMany();
    if (pernoctes.length === 0) return [];

    const bomberoIds = [...new Set(pernoctes.map((p) => p.bomberoId))];
    const bomberos = await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany();
    const mapa = new Map(bomberos.map((b) => [b.id, b]));
    return pernoctes.map((p) => ({
      ...p,
      nombreCompleto: mapa.get(p.bomberoId) ? `${mapa.get(p.bomberoId)!.nombre} ${mapa.get(p.bomberoId)!.apellido}` : '(desconocido)',
      codigoBombero: mapa.get(p.bomberoId)?.numeroBombero ?? null,
    }));
  }

  async crear(dto: CreatePernocteDto, actorId: string, ip?: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);

    const pernocte = await this.pernocteRepo.save(
      this.pernocteRepo.create({
        guardiaId: dto.guardiaId ?? null,
        fecha: dto.fecha,
        bomberoId: dto.bomberoId,
        horaEntrada: dto.horaEntrada ? new Date(dto.horaEntrada) : null,
        horaSalida: dto.horaSalida ? new Date(dto.horaSalida) : null,
        motivo: dto.motivo ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.pernoctes',
      recursoId: pernocte.id,
      datosDespues: pernocte,
      ip: ip ?? null,
    });
    return pernocte;
  }

  async registrarSalida(id: string, horaSalida: string, actorId: string, ip?: string) {
    const pernocte = await this.pernocteRepo.findOne({ where: { id } });
    if (!pernocte) throw new NotFoundException(`Pernocte ${id} no encontrado`);
    const anterior = { ...pernocte };
    await this.pernocteRepo.update(id, { horaSalida: new Date(horaSalida) });
    const actualizado = await this.pernocteRepo.findOne({ where: { id } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGISTRAR_SALIDA_PERNOCTE',
      recurso: 'operaciones.pernoctes',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }
}
