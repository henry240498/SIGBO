import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionPermisoRol, AsignacionRol, Permiso, Rol } from '../../shared/entities';
import { AuditoriaService } from './auditoria.service';
import { AccionContexto } from './usuarios.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { DuplicarRolDto } from './dto/duplicar-rol.dto';
import { CopiarPermisosDto } from './dto/copiar-permisos.dto';
import { SetPermisosDto } from './dto/set-permisos.dto';
import { SesionesService } from './sesiones.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    @InjectRepository(AsignacionPermisoRol)
    private readonly asignacionPermisoRolRepo: Repository<AsignacionPermisoRol>,
    @InjectRepository(AsignacionRol) private readonly asignacionRolRepo: Repository<AsignacionRol>,
    @InjectRepository(Permiso) private readonly permisoRepo: Repository<Permiso>,
    private readonly auditoriaService: AuditoriaService,
    private readonly sesionesService: SesionesService,
  ) {}

  private async cerrarSesionesDeRol(rolId: string): Promise<void> {
    const asignaciones = await this.asignacionRolRepo.find({ where: { rolId } });
    await Promise.all([...new Set(asignaciones.map((asignacion) => asignacion.usuarioId))]
      .map((usuarioId) => this.sesionesService.cerrarTodas(usuarioId)));
  }

  findAll() {
    return this.rolRepo.find({ order: { prioridad: 'DESC' } });
  }

  async findOne(id: string) {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol ${id} no encontrado`);
    return rol;
  }

  async getPermisos(rolId: string): Promise<Permiso[]> {
    const asignaciones = await this.asignacionPermisoRolRepo.find({ where: { rolId } });
    const ids = asignaciones.map((a) => a.permisoId);
    if (ids.length === 0) return [];
    return this.permisoRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids }).getMany();
  }

  async create(dto: CreateRolDto, ctx: AccionContexto) {
    const existente = await this.rolRepo.findOne({ where: { nombre: dto.nombre } });
    if (existente) throw new ConflictException(`Ya existe un rol llamado "${dto.nombre}"`);

    const rol = await this.rolRepo.save(
      this.rolRepo.create({
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        color: dto.color ?? '#6B7280',
        icono: dto.icono ?? null,
        prioridad: dto.prioridad ?? 0,
        esAdministrativo: dto.esAdministrativo ?? false,
        esOperativo: dto.esOperativo ?? true,
        creadoPor: ctx.actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'CREAR',
      recurso: 'rol',
      recursoId: rol.id,
      datosDespues: dto,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return rol;
  }

  async update(id: string, dto: UpdateRolDto, ctx: AccionContexto) {
    const rol = await this.findOne(id);

    await this.rolRepo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
      ...(dto.icono !== undefined ? { icono: dto.icono } : {}),
      ...(dto.prioridad !== undefined ? { prioridad: dto.prioridad } : {}),
      ...(dto.esAdministrativo !== undefined ? { esAdministrativo: dto.esAdministrativo } : {}),
      ...(dto.esOperativo !== undefined ? { esOperativo: dto.esOperativo } : {}),
    });

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'EDITAR',
      recurso: 'rol',
      recursoId: id,
      datosAntes: rol,
      datosDespues: dto,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(id);
  }

  async eliminar(id: string, ctx: AccionContexto) {
    const rol = await this.findOne(id);
    if (rol.esSistema) {
      throw new BadRequestException('No se puede eliminar un rol del sistema. Puede desactivarlo.');
    }

    const usuariosAsignados = await this.asignacionRolRepo.count({ where: { rolId: id } });
    if (usuariosAsignados > 0) {
      throw new BadRequestException(
        `No se puede eliminar: ${usuariosAsignados} usuario(s) tienen este rol asignado`,
      );
    }

    await this.asignacionPermisoRolRepo.delete({ rolId: id });
    await this.rolRepo.delete(id);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'ELIMINAR',
      recurso: 'rol',
      recursoId: id,
      datosAntes: rol,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { ok: true };
  }

  async activar(id: string, activo: boolean, ctx: AccionContexto) {
    await this.findOne(id);
    await this.rolRepo.update(id, { activo });
    await this.cerrarSesionesDeRol(id);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: activo ? 'ACTIVAR' : 'DESACTIVAR',
      recurso: 'rol',
      recursoId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(id);
  }

  async duplicar(id: string, dto: DuplicarRolDto, ctx: AccionContexto) {
    const original = await this.findOne(id);
    const existente = await this.rolRepo.findOne({ where: { nombre: dto.nombreNuevo } });
    if (existente) throw new ConflictException(`Ya existe un rol llamado "${dto.nombreNuevo}"`);

    const copia = await this.rolRepo.save(
      this.rolRepo.create({
        nombre: dto.nombreNuevo,
        descripcion: original.descripcion,
        color: original.color,
        icono: original.icono,
        prioridad: original.prioridad,
        esAdministrativo: original.esAdministrativo,
        esOperativo: original.esOperativo,
        creadoPor: ctx.actorId,
      }),
    );

    const permisosOriginal = await this.asignacionPermisoRolRepo.find({ where: { rolId: id } });
    for (const p of permisosOriginal) {
      await this.asignacionPermisoRolRepo.save(
        this.asignacionPermisoRolRepo.create({
          rolId: copia.id,
          permisoId: p.permisoId,
          asignadoPor: ctx.actorId,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'DUPLICAR',
      recurso: 'rol',
      recursoId: copia.id,
      datosDespues: { origenId: id, permisosCopiados: permisosOriginal.length },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return copia;
  }

  async copiarPermisos(id: string, dto: CopiarPermisosDto, ctx: AccionContexto) {
    await this.findOne(id);
    await this.findOne(dto.rolOrigenId);

    const permisosOrigen = await this.asignacionPermisoRolRepo.find({ where: { rolId: dto.rolOrigenId } });
    const actuales = await this.asignacionPermisoRolRepo.find({ where: { rolId: id } });
    const actualesIds = new Set(actuales.map((a) => a.permisoId));

    let agregados = 0;
    for (const p of permisosOrigen) {
      if (!actualesIds.has(p.permisoId)) {
        await this.asignacionPermisoRolRepo.save(
          this.asignacionPermisoRolRepo.create({
            rolId: id,
            permisoId: p.permisoId,
            asignadoPor: ctx.actorId,
          }),
        );
        agregados++;
      }
    }

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'COPIAR_PERMISOS',
      recurso: 'rol',
      recursoId: id,
      datosDespues: { rolOrigenId: dto.rolOrigenId, permisosAgregados: agregados },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    if (agregados > 0) await this.cerrarSesionesDeRol(id);

    return this.getPermisos(id);
  }

  async setPermisos(id: string, dto: SetPermisosDto, ctx: AccionContexto) {
    await this.findOne(id);

    const actuales = await this.asignacionPermisoRolRepo.find({ where: { rolId: id } });
    const actualesIds = new Set(actuales.map((a) => a.permisoId));
    const nuevosIds = new Set(dto.permisosIds);

    const aQuitar = actuales.filter((a) => !nuevosIds.has(a.permisoId));
    const aAgregar = dto.permisosIds.filter((pid) => !actualesIds.has(pid));

    if (aQuitar.length > 0) await this.asignacionPermisoRolRepo.remove(aQuitar);
    for (const permisoId of aAgregar) {
      await this.asignacionPermisoRolRepo.save(
        this.asignacionPermisoRolRepo.create({ rolId: id, permisoId, asignadoPor: ctx.actorId }),
      );
    }
    if (aQuitar.length > 0 || aAgregar.length > 0) await this.cerrarSesionesDeRol(id);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'SET_PERMISOS',
      recurso: 'rol',
      recursoId: id,
      datosAntes: { permisosIds: [...actualesIds] },
      datosDespues: { permisosIds: dto.permisosIds },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.getPermisos(id);
  }
}
