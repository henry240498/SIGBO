import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guardia, InspeccionEstacion, Parametro } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateInspeccionEstacionDto } from './dto/create-inspeccion-estacion.dto';

@Injectable()
export class InspeccionesEstacionService {
  constructor(
    @InjectRepository(InspeccionEstacion) private readonly inspeccionRepo: Repository<InspeccionEstacion>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async listar(guardiaId: string) {
    const inspecciones = await this.inspeccionRepo.find({ where: { guardiaId }, order: { creadoEn: 'ASC' } });
    if (inspecciones.length === 0) return [];
    const sectorIds = [...new Set(inspecciones.map((i) => i.sector))];
    const sectores = await this.parametroRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids: sectorIds }).getMany();
    const mapa = new Map(sectores.map((s) => [s.id, s.nombre]));
    return inspecciones.map((i) => ({ ...i, sectorNombre: mapa.get(i.sector) ?? null }));
  }

  async crear(guardiaId: string, dto: CreateInspeccionEstacionDto, actorId: string, ip?: string) {
    const guardia = await this.guardiaRepo.findOne({ where: { id: guardiaId } });
    if (!guardia) throw new NotFoundException(`Guardia ${guardiaId} no encontrada`);

    const sector = await this.parametroRepo.findOne({ where: { id: dto.sector, tipo: 'SECTOR_ESTACION' } });
    if (!sector) throw new NotFoundException(`Sector ${dto.sector} no encontrado en el catalogo SECTOR_ESTACION`);

    const inspeccion = await this.inspeccionRepo.save(
      this.inspeccionRepo.create({
        guardiaId,
        sector: dto.sector,
        estado: dto.estado as InspeccionEstacion['estado'],
        observacion: dto.observacion ?? null,
        responsableId: dto.responsableId ?? null,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.inspecciones_estacion',
      recursoId: inspeccion.id,
      datosDespues: inspeccion,
      ip: ip ?? null,
    });
    return inspeccion;
  }
}
