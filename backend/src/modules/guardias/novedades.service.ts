import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Guardia, NovedadGuardia } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateNovedadDto } from './dto/create-novedad.dto';

@Injectable()
export class NovedadesService {
  constructor(
    @InjectRepository(NovedadGuardia) private readonly novedadRepo: Repository<NovedadGuardia>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async listar(guardiaId: string) {
    const novedades = await this.novedadRepo.find({ where: { guardiaId }, order: { fechaHora: 'ASC' } });
    if (novedades.length === 0) return [];
    const bomberoIds = [...new Set(novedades.filter((n) => n.bomberoId).map((n) => n.bomberoId as string))];
    const bomberos = bomberoIds.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
      : [];
    const mapa = new Map(bomberos.map((b) => [b.id, b]));
    return novedades.map((n) => ({
      ...n,
      autorNombre: n.bomberoId && mapa.get(n.bomberoId) ? `${mapa.get(n.bomberoId)!.nombre} ${mapa.get(n.bomberoId)!.apellido}` : null,
    }));
  }

  async crear(guardiaId: string, dto: CreateNovedadDto, actorId: string, ip?: string) {
    const guardia = await this.guardiaRepo.findOne({ where: { id: guardiaId } });
    if (!guardia) throw new NotFoundException(`Guardia ${guardiaId} no encontrada`);

    const novedad = await this.novedadRepo.save(
      this.novedadRepo.create({
        guardiaId,
        fechaHora: dto.fechaHora ? new Date(dto.fechaHora) : new Date(),
        bomberoId: dto.bomberoId ?? null,
        texto: dto.texto,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.novedades_guardia',
      recursoId: novedad.id,
      datosDespues: novedad,
      ip: ip ?? null,
    });
    return novedad;
  }
}
