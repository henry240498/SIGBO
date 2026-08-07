import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionPermisoDirecto, AsignacionPermisoRol, Permiso } from '../../shared/entities';
import { AuditoriaService } from './auditoria.service';
import { AccionContexto } from './usuarios.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso) private readonly permisoRepo: Repository<Permiso>,
    @InjectRepository(AsignacionPermisoRol)
    private readonly asignacionPermisoRolRepo: Repository<AsignacionPermisoRol>,
    @InjectRepository(AsignacionPermisoDirecto)
    private readonly asignacionPermisoDirectoRepo: Repository<AsignacionPermisoDirecto>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll() {
    return this.permisoRepo.find({ order: { categoria: 'ASC', nombre: 'ASC' } });
  }

  async findOne(id: string) {
    const permiso = await this.permisoRepo.findOne({ where: { id } });
    if (!permiso) throw new NotFoundException(`Permiso ${id} no encontrado`);
    return permiso;
  }

  async create(dto: CreatePermisoDto, ctx: AccionContexto) {
    const existente = await this.permisoRepo.findOne({ where: { nombre: dto.nombre } });
    if (existente) throw new ConflictException(`Ya existe un permiso llamado "${dto.nombre}"`);

    const permiso = await this.permisoRepo.save(
      this.permisoRepo.create({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        recurso: dto.recurso,
        accion: dto.accion,
        categoria: dto.categoria ?? null,
        esSistema: false,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'CREAR',
      recurso: 'permiso',
      recursoId: permiso.id,
      datosDespues: dto,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return permiso;
  }

  async update(id: string, dto: UpdatePermisoDto, ctx: AccionContexto) {
    const permiso = await this.findOne(id);

    await this.permisoRepo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.recurso !== undefined ? { recurso: dto.recurso } : {}),
      ...(dto.accion !== undefined ? { accion: dto.accion } : {}),
      ...(dto.categoria !== undefined ? { categoria: dto.categoria } : {}),
    });

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'EDITAR',
      recurso: 'permiso',
      recursoId: id,
      datosAntes: permiso,
      datosDespues: dto,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(id);
  }

  async eliminar(id: string, ctx: AccionContexto) {
    const permiso = await this.findOne(id);
    if (permiso.esSistema) {
      throw new BadRequestException('No se puede eliminar un permiso del sistema');
    }

    await this.asignacionPermisoRolRepo.delete({ permisoId: id });
    await this.asignacionPermisoDirectoRepo.delete({ permisoId: id });
    await this.permisoRepo.delete(id);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'ELIMINAR',
      recurso: 'permiso',
      recursoId: id,
      datosAntes: permiso,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { ok: true };
  }
}
