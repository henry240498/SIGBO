import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionGuardia, Bombero, Guardia } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateGuardiaDto } from './dto/create-guardia.dto';
import { AsignarBomberoGuardiaDto } from './dto/asignar-bombero-guardia.dto';

@Injectable()
export class GuardiasService {
  constructor(
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionRepo: Repository<AsignacionGuardia>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(desde?: string, hasta?: string) {
    const query = this.guardiaRepo.createQueryBuilder('g').orderBy('g.fecha', 'DESC');
    if (desde) query.andWhere('g.fecha >= :desde', { desde });
    if (hasta) query.andWhere('g.fecha <= :hasta', { hasta });
    return query.getMany();
  }

  async findOne(id: string) {
    const guardia = await this.guardiaRepo.findOne({ where: { id } });
    if (!guardia) throw new NotFoundException(`Guardia ${id} no encontrada`);
    return guardia;
  }

  async create(dto: CreateGuardiaDto, actorId: string, ip?: string) {
    const guardia = await this.guardiaRepo.save(
      this.guardiaRepo.create({
        fecha: dto.fecha,
        turno: dto.turno as any,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        tipo: (dto.tipo as any) ?? 'ORDINARIA',
        jefeGuardiaId: dto.jefeGuardiaId ?? null,
        observaciones: dto.observaciones ?? null,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.guardias',
      recursoId: guardia.id,
      datosDespues: guardia,
      ip: ip ?? null,
    });
    return guardia;
  }

  async listarAsignaciones(guardiaId: string) {
    await this.findOne(guardiaId);
    const asignaciones = await this.asignacionRepo.find({ where: { guardiaId } });
    if (asignaciones.length === 0) return [];
    const bomberoIds = asignaciones.map((a) => a.bomberoId);
    const bomberos = await this.bomberoRepo
      .createQueryBuilder('b')
      .where('b.id IN (:...ids)', { ids: bomberoIds })
      .getMany();
    const mapa = new Map(bomberos.map((b) => [b.id, b]));
    return asignaciones.map((a) => ({
      ...a,
      nombreCompleto: mapa.get(a.bomberoId) ? `${mapa.get(a.bomberoId)!.nombre} ${mapa.get(a.bomberoId)!.apellido}` : '(desconocido)',
      codigoBombero: mapa.get(a.bomberoId)?.numeroBombero ?? null,
    }));
  }

  async asignarBombero(guardiaId: string, dto: AsignarBomberoGuardiaDto, actorId: string, ip?: string) {
    await this.findOne(guardiaId);
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);

    const asignacion = await this.asignacionRepo.save(
      this.asignacionRepo.create({
        guardiaId,
        bomberoId: dto.bomberoId,
        rol: dto.rol ?? null,
        estado: 'ASIGNADO',
        fechaAsignacion: new Date(),
        asignadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ASIGNAR_BOMBERO_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacion.id,
      datosDespues: asignacion,
      ip: ip ?? null,
    });
    return asignacion;
  }

  async quitarAsignacion(guardiaId: string, asignacionId: string, actorId: string, ip?: string) {
    const asignacion = await this.asignacionRepo.findOne({ where: { id: asignacionId, guardiaId } });
    if (!asignacion) throw new NotFoundException(`Asignacion ${asignacionId} no encontrada en esta guardia`);
    await this.asignacionRepo.delete(asignacionId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'QUITAR_ASIGNACION_GUARDIA',
      recurso: 'operaciones.asignacion_guardias',
      recursoId: asignacionId,
      datosAntes: asignacion,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
