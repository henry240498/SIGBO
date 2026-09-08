import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Guardia, GrupoGuardia, GrupoGuardiaMiembro } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ElegibilidadService } from './elegibilidad.service';
import { CreateGrupoGuardiaDto, UpdateGrupoGuardiaDto } from './dto/create-grupo-guardia.dto';
import { AgregarMiembroGrupoDto } from './dto/agregar-miembro-grupo.dto';

@Injectable()
export class GruposGuardiaService {
  constructor(
    @InjectRepository(GrupoGuardia) private readonly grupoRepo: Repository<GrupoGuardia>,
    @InjectRepository(GrupoGuardiaMiembro) private readonly miembroRepo: Repository<GrupoGuardiaMiembro>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    private readonly elegibilidadService: ElegibilidadService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    return this.grupoRepo.find({
      where: estado ? { estado: estado as GrupoGuardia['estado'] } : undefined,
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string) {
    const grupo = await this.grupoRepo.findOne({ where: { id } });
    if (!grupo) throw new NotFoundException(`Grupo de guardia ${id} no encontrado`);
    return grupo;
  }

  async create(dto: CreateGrupoGuardiaDto, actorId: string, ip?: string) {
    if (dto.oficialACargoId === dto.choferId) {
      throw new BadRequestException('El responsable a cargo y el chofer deben ser personas distintas');
    }
    await this.elegibilidadService.validar('OFICIAL_A_CARGO', dto.oficialACargoId);
    await this.elegibilidadService.validar('CHOFER', dto.choferId);
    const { grupo, chofer } = await this.grupoRepo.manager.transaction(async (manager) => {
      const grupoCreado = await manager.getRepository(GrupoGuardia).save(
        manager.getRepository(GrupoGuardia).create({
          nombre: dto.nombre,
          oficialACargoId: dto.oficialACargoId,
          estado: (dto.estado as GrupoGuardia['estado']) ?? 'ACTIVO',
          observaciones: dto.observaciones ?? null,
          cicloRotacionDias: dto.cicloRotacionDias ?? null,
          diasSemanaCsv: dto.diasSemanaCsv ?? null,
          cantidadMinima: dto.cantidadMinima ?? null,
          cantidadMaxima: dto.cantidadMaxima ?? null,
          cantidadOficiales: dto.cantidadOficiales ?? null,
          cantidadChoferes: dto.cantidadChoferes ?? null,
          creadoPor: actorId,
        }),
      );
      const choferCreado = await manager.getRepository(GrupoGuardiaMiembro).save(
        manager.getRepository(GrupoGuardiaMiembro).create({
          grupoId: grupoCreado.id, bomberoId: dto.choferId, rol: 'CHOFER', orden: 0,
        }),
      );
      return { grupo: grupoCreado, chofer: choferCreado };
    });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.grupos_guardia',
      recursoId: grupo.id,
      datosDespues: grupo,
      ip: ip ?? null,
    });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'AGREGAR_MIEMBRO_GRUPO_GUARDIA',
      recurso: 'operaciones.grupos_guardia_miembros',
      recursoId: chofer.id,
      datosDespues: chofer,
      ip: ip ?? null,
    });
    return grupo;
  }

  async update(id: string, dto: UpdateGrupoGuardiaDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);
    if (dto.oficialACargoId) {
      await this.elegibilidadService.validar('OFICIAL_A_CARGO', dto.oficialACargoId);
    }
    await this.grupoRepo.update(id, { ...dto } as Partial<GrupoGuardia>);
    const actualizado = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'operaciones.grupos_guardia',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  /** Guardias realizadas/proximas de un grupo (seccion 41 del pedido). */
  async historial(grupoId: string) {
    await this.findOne(grupoId);
    return this.guardiaRepo.find({ where: { grupoGuardiaId: grupoId }, order: { fecha: 'DESC' } });
  }

  async listarMiembros(grupoId: string) {
    await this.findOne(grupoId);
    const miembros = await this.miembroRepo.find({ where: { grupoId }, order: { orden: 'ASC' } });
    if (miembros.length === 0) return [];
    const bomberoIds = miembros.map((m) => m.bomberoId);
    const bomberos = await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany();
    const mapa = new Map(bomberos.map((b) => [b.id, b]));
    return miembros.map((m) => ({
      ...m,
      nombreCompleto: mapa.get(m.bomberoId) ? `${mapa.get(m.bomberoId)!.nombre} ${mapa.get(m.bomberoId)!.apellido}` : '(desconocido)',
      codigoBombero: mapa.get(m.bomberoId)?.numeroBombero ?? null,
    }));
  }

  async agregarMiembro(grupoId: string, dto: AgregarMiembroGrupoDto, actorId: string, ip?: string) {
    await this.findOne(grupoId);
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);

    const rol = dto.rol ?? 'TITULAR';
    if (rol === 'CHOFER') {
      await this.elegibilidadService.validar('CHOFER', dto.bomberoId);
    }

    const miembro = await this.miembroRepo.save(
      this.miembroRepo.create({
        grupoId,
        bomberoId: dto.bomberoId,
        rol: rol as GrupoGuardiaMiembro['rol'],
        orden: dto.orden ?? 0,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'AGREGAR_MIEMBRO_GRUPO_GUARDIA',
      recurso: 'operaciones.grupos_guardia_miembros',
      recursoId: miembro.id,
      datosDespues: miembro,
      ip: ip ?? null,
    });
    return miembro;
  }

  async quitarMiembro(grupoId: string, miembroId: string, actorId: string, ip?: string) {
    const miembro = await this.miembroRepo.findOne({ where: { id: miembroId, grupoId } });
    if (!miembro) throw new NotFoundException(`Miembro ${miembroId} no encontrado en este grupo`);
    await this.miembroRepo.delete(miembroId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'QUITAR_MIEMBRO_GRUPO_GUARDIA',
      recurso: 'operaciones.grupos_guardia_miembros',
      recursoId: miembroId,
      datosAntes: miembro,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
