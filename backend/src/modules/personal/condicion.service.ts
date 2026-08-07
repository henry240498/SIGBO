import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Bombero,
  CondicionApoyoEconomico,
  CondicionCombatiente,
  CondicionHonorario,
  CondicionIncorporado,
  CondicionInstitucional,
  HistorialInstitucional,
} from '../../shared/entities';
import { ActualizarCondicionDto } from './dto/actualizar-condicion.dto';

@Injectable()
export class CondicionService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(CondicionIncorporado)
    private readonly condicionIncorporadoRepo: Repository<CondicionIncorporado>,
    @InjectRepository(CondicionCombatiente)
    private readonly condicionCombatienteRepo: Repository<CondicionCombatiente>,
    @InjectRepository(CondicionApoyoEconomico)
    private readonly condicionApoyoEconomicoRepo: Repository<CondicionApoyoEconomico>,
    @InjectRepository(CondicionHonorario)
    private readonly condicionHonorarioRepo: Repository<CondicionHonorario>,
    @InjectRepository(HistorialInstitucional)
    private readonly historialInstitucionalRepo: Repository<HistorialInstitucional>,
  ) {}

  /** Repositorio de la tabla de detalle correspondiente a una condicion institucional. */
  private repoDetalle(condicion: string): Repository<any> {
    switch (condicion) {
      case 'INCORPORADO':
        return this.condicionIncorporadoRepo;
      case 'COMBATIENTE':
        return this.condicionCombatienteRepo;
      case 'APOYO_ECONOMICO':
        return this.condicionApoyoEconomicoRepo;
      case 'HONORARIO':
        return this.condicionHonorarioRepo;
      default:
        throw new BadRequestException(`Condicion institucional invalida: ${condicion}`);
    }
  }

  private async buscarBombero(bomberoId: string): Promise<Bombero> {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);
    return bombero;
  }

  async obtener(bomberoId: string) {
    const bombero = await this.buscarBombero(bomberoId);
    if (!bombero.condicionInstitucional) {
      return { condicionInstitucional: null, detalle: null };
    }

    const repo = this.repoDetalle(bombero.condicionInstitucional);
    const detalle = await repo.findOne({ where: { bomberoId } });

    return {
      condicionInstitucional: bombero.condicionInstitucional,
      detalle: detalle ?? null,
    };
  }

  async actualizar(bomberoId: string, dto: ActualizarCondicionDto, usuarioId: string) {
    const bombero = await this.buscarBombero(bomberoId);
    const condicionAnterior = bombero.condicionInstitucional;

    if (dto.condicionInstitucional !== condicionAnterior) {
      await this.bomberoRepo.update(bomberoId, {
        condicionInstitucional: dto.condicionInstitucional as CondicionInstitucional,
      });

      await this.historialInstitucionalRepo.save(
        this.historialInstitucionalRepo.create({
          bomberoId,
          tipoMovimiento: 'CAMBIO_CONDICION',
          fecha: new Date().toISOString().slice(0, 10),
          usuarioResponsableId: usuarioId,
          motivo: `Cambio de condicion institucional de ${condicionAnterior ?? 'SIN_CONDICION'} a ${dto.condicionInstitucional}`,
        }),
      );
    }

    const repo = this.repoDetalle(dto.condicionInstitucional);
    const existente = await repo.findOne({ where: { bomberoId } });

    if (existente) {
      if (dto.detalle) {
        await repo.update(existente.id, dto.detalle);
      }
    } else if (dto.detalle) {
      await repo.save(repo.create({ bomberoId, ...dto.detalle }));
    }

    return this.obtener(bomberoId);
  }
}
