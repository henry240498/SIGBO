import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  AsignacionPermisoDirecto,
  AsignacionRol,
  HistorialContrasena,
  Permiso,
  Rol,
  Usuario,
} from '../../shared/entities';
import { AuditoriaService } from './auditoria.service';
import { SesionesService } from './sesiones.service';
import { PolicyEngineService } from './policy-engine.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { ResetearPasswordDto } from './dto/resetear-password.dto';
import { AsignarRolesDto } from './dto/asignar-roles.dto';
import { AsignarPermisoDirectoDto } from './dto/asignar-permiso-directo.dto';
import { BloqueoDto } from './dto/bloqueo.dto';
import { calcularExpiracionPassword, passwordEnHistorial } from '../../shared/utils/password-policy';

export interface AccionContexto {
  actorId: string;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(AsignacionRol) private readonly asignacionRolRepo: Repository<AsignacionRol>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    @InjectRepository(Permiso) private readonly permisoRepo: Repository<Permiso>,
    @InjectRepository(AsignacionPermisoDirecto)
    private readonly asignacionPermisoDirectoRepo: Repository<AsignacionPermisoDirecto>,
    @InjectRepository(HistorialContrasena)
    private readonly historialRepo: Repository<HistorialContrasena>,
    private readonly auditoriaService: AuditoriaService,
    private readonly sesionesService: SesionesService,
    private readonly policyEngine: PolicyEngineService,
  ) {}

  async findAll() {
    const usuarios = await this.usuarioRepo.find({
      select: ['id', 'email', 'username', 'estado', 'ultimoAcceso', 'creadoEn', 'bloqueadoHasta'],
      order: { creadoEn: 'DESC' },
    });

    const asignaciones = await this.asignacionRolRepo.find();
    const roles = await this.rolRepo.find();
    const rolMap = new Map(roles.map((r) => [r.id, r]));

    return usuarios.map((u) => ({
      ...u,
      roles: asignaciones
        .filter((a) => a.usuarioId === u.id)
        .map((a) => rolMap.get(a.rolId))
        .filter((r): r is Rol => r !== undefined)
        .map((r) => ({ id: r.id, nombre: r.nombre, color: r.color })),
    }));
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'estado', 'ultimoAcceso', 'creadoEn', 'bomberoId'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async getRoles(usuarioId: string) {
    const asignaciones = await this.asignacionRolRepo.find({ where: { usuarioId } });
    const ids = asignaciones.map((a) => a.rolId);
    if (ids.length === 0) return [];
    return this.rolRepo.createQueryBuilder('r').where('r.id IN (:...ids)', { ids }).getMany();
  }

  async detalle(id: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'estado',
        'ultimoAcceso',
        'ipUltimoAcceso',
        'intentosFallidos',
        'bloqueadoHasta',
        'twoFactorEnabled',
        'debeCambiarPassword',
        'passwordExpiraEn',
        'bomberoId',
        'creadoEn',
      ],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const [roles, permisos, permisosDirectos, sesiones, auditoria] = await Promise.all([
      this.getRoles(id),
      this.policyEngine.getPermisosEfectivos(id),
      this.getPermisosDirectos(id),
      this.sesionesService.findByUsuario(id),
      this.auditoriaService.findPorUsuario(id, 20),
    ]);

    return { usuario, roles, permisos, permisosDirectos, sesiones, auditoria };
  }

  async getPermisosDirectos(usuarioId: string) {
    const asignaciones = await this.asignacionPermisoDirectoRepo.find({ where: { usuarioId } });
    if (asignaciones.length === 0) return [];

    const permisoIds = asignaciones.map((a) => a.permisoId);
    const permisos = await this.permisoRepo
      .createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids: permisoIds })
      .getMany();
    const permisoMap = new Map(permisos.map((p) => [p.id, p]));

    return asignaciones.map((a) => ({
      permisoId: a.permisoId,
      nombre: permisoMap.get(a.permisoId)?.nombre ?? a.permisoId,
      categoria: permisoMap.get(a.permisoId)?.categoria ?? null,
      concedido: a.concedido,
      motivo: a.motivo,
      fechaAsignacion: a.fechaAsignacion,
    }));
  }

  async create(dto: CreateUsuarioDto, ctx: AccionContexto) {
    const existente = await this.usuarioRepo
      .createQueryBuilder('u')
      .where('u.username = :username OR u.email = :email', { username: dto.username, email: dto.email })
      .getOne();
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese username o email');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const usuario = await this.usuarioRepo.save(
      this.usuarioRepo.create({
        username: dto.username,
        email: dto.email,
        passwordHash,
        salt,
        bomberoId: dto.bomberoId ?? null,
        estado: (dto.estado as Usuario['estado']) ?? 'ACTIVO',
        twoFactorEnabled: dto.twoFactorEnabled ?? false,
        debeCambiarPassword: dto.debeCambiarPassword ?? false,
        passwordExpiraEn: calcularExpiracionPassword(),
        creadoPor: ctx.actorId,
      }),
    );

    await this.historialRepo.save(this.historialRepo.create({ usuarioId: usuario.id, passwordHash }));

    if (dto.rolesIds && dto.rolesIds.length > 0) {
      await this.reemplazarRoles(usuario.id, dto.rolesIds, ctx, false);
    }

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'CREAR',
      recurso: 'usuario',
      recursoId: usuario.id,
      datosDespues: { username: usuario.username, email: usuario.email, estado: usuario.estado },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(usuario.id);
  }

  async update(id: string, dto: UpdateUsuarioDto, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const antes = {
      email: usuario.email,
      estado: usuario.estado,
      twoFactorEnabled: usuario.twoFactorEnabled,
      bomberoId: usuario.bomberoId,
    };

    await this.usuarioRepo.update(id, {
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as Usuario['estado'] } : {}),
      ...(dto.twoFactorEnabled !== undefined ? { twoFactorEnabled: dto.twoFactorEnabled } : {}),
      ...(dto.bomberoId !== undefined ? { bomberoId: dto.bomberoId } : {}),
      ...(dto.idioma !== undefined ? { idioma: dto.idioma } : {}),
      ...(dto.zonaHoraria !== undefined ? { zonaHoraria: dto.zonaHoraria } : {}),
    });

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'EDITAR',
      recurso: 'usuario',
      recursoId: id,
      datosAntes: antes,
      datosDespues: dto,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(id);
  }

  async darBaja(id: string, motivo: string | undefined, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    await this.usuarioRepo.update(id, { estado: 'INACTIVO' });
    await this.sesionesService.cerrarTodas(id);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'BAJA_LOGICA',
      recurso: 'usuario',
      recursoId: id,
      datosAntes: { estado: usuario.estado },
      datosDespues: { estado: 'INACTIVO', motivo: motivo ?? null },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(id);
  }

  async bloquear(id: string, dto: BloqueoDto, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    const bloqueadoHasta = dto.bloquear
      ? dto.minutos
        ? new Date(Date.now() + dto.minutos * 60 * 1000)
        : new Date('9999-12-31T23:59:59Z')
      : null;

    await this.usuarioRepo.update(id, {
      bloqueadoHasta,
      intentosFallidos: dto.bloquear ? usuario.intentosFallidos : 0,
    });

    if (dto.bloquear) {
      await this.sesionesService.cerrarTodas(id);
    }

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: dto.bloquear ? 'BLOQUEAR' : 'DESBLOQUEAR',
      recurso: 'usuario',
      recursoId: id,
      datosDespues: { bloqueadoHasta },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return this.findOne(id);
  }

  async resetearPassword(id: string, dto: ResetearPasswordDto, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);

    if (await passwordEnHistorial(this.historialRepo, id, dto.passwordNueva)) {
      throw new BadRequestException('No se puede reutilizar una de las ultimas 3 contrasenas');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.passwordNueva, salt);

    await this.usuarioRepo.update(id, {
      passwordHash,
      salt,
      debeCambiarPassword: dto.forzarCambio ?? true,
      passwordExpiraEn: calcularExpiracionPassword(),
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });
    await this.historialRepo.save(this.historialRepo.create({ usuarioId: id, passwordHash }));
    await this.sesionesService.cerrarTodas(id);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'RESETEAR_PASSWORD',
      recurso: 'usuario',
      recursoId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { ok: true };
  }

  async cambiarPasswordPropia(usuarioId: string, dto: CambiarPasswordDto, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    const passwordValida = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!passwordValida) throw new UnauthorizedException('Contrasena actual incorrecta');

    if (await passwordEnHistorial(this.historialRepo, usuarioId, dto.passwordNueva)) {
      throw new BadRequestException('No se puede reutilizar una de las ultimas 3 contrasenas');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.passwordNueva, salt);

    await this.usuarioRepo.update(usuarioId, {
      passwordHash,
      salt,
      debeCambiarPassword: false,
      passwordExpiraEn: calcularExpiracionPassword(),
    });
    await this.historialRepo.save(this.historialRepo.create({ usuarioId, passwordHash }));

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'CAMBIAR_PASSWORD_PROPIA',
      recurso: 'usuario',
      recursoId: usuarioId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { ok: true };
  }

  async reemplazarRoles(
    usuarioId: string,
    rolesIds: string[],
    ctx: AccionContexto,
    auditar = true,
  ) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    const actuales = await this.asignacionRolRepo.find({ where: { usuarioId } });
    const actualesIds = new Set(actuales.map((a) => a.rolId));
    const nuevosIds = new Set(rolesIds);

    const aQuitar = actuales.filter((a) => !nuevosIds.has(a.rolId));
    const aAgregar = rolesIds.filter((rid) => !actualesIds.has(rid));

    if (aQuitar.length > 0) {
      await this.asignacionRolRepo.remove(aQuitar);
    }
    for (const rolId of aAgregar) {
      await this.asignacionRolRepo.save(
        this.asignacionRolRepo.create({ usuarioId, rolId, asignadoPor: ctx.actorId }),
      );
    }
    if (aQuitar.length > 0 || aAgregar.length > 0) {
      await this.sesionesService.cerrarTodas(usuarioId);
    }

    if (auditar) {
      await this.auditoriaService.registrar({
        usuarioId: ctx.actorId,
        accion: 'ASIGNAR_ROLES',
        recurso: 'usuario',
        recursoId: usuarioId,
        datosAntes: { rolesIds: [...actualesIds] },
        datosDespues: { rolesIds },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
    }

    return this.getRoles(usuarioId);
  }

  async asignarPermisoDirecto(usuarioId: string, dto: AsignarPermisoDirectoDto, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    const permiso = await this.permisoRepo.findOne({ where: { id: dto.permisoId } });
    if (!permiso) throw new NotFoundException(`Permiso ${dto.permisoId} no encontrado`);

    const existente = await this.asignacionPermisoDirectoRepo.findOne({
      where: { usuarioId, permisoId: dto.permisoId },
    });

    if (existente) {
      await this.asignacionPermisoDirectoRepo.update(existente.id, {
        concedido: dto.concedido,
        motivo: dto.motivo ?? null,
        asignadoPor: ctx.actorId,
      });
    } else {
      await this.asignacionPermisoDirectoRepo.save(
        this.asignacionPermisoDirectoRepo.create({
          usuarioId,
          permisoId: dto.permisoId,
          concedido: dto.concedido,
          motivo: dto.motivo ?? null,
          asignadoPor: ctx.actorId,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: dto.concedido ? 'CONCEDER_PERMISO_DIRECTO' : 'DENEGAR_PERMISO_DIRECTO',
      recurso: 'usuario',
      recursoId: usuarioId,
      datosDespues: { permiso: permiso.nombre, concedido: dto.concedido, motivo: dto.motivo },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    await this.sesionesService.cerrarTodas(usuarioId);

    return this.policyEngine.getPermisosEfectivos(usuarioId);
  }

  async quitarPermisoDirecto(usuarioId: string, permisoId: string, ctx: AccionContexto) {
    const existente = await this.asignacionPermisoDirectoRepo.findOne({
      where: { usuarioId, permisoId },
    });
    if (!existente) throw new NotFoundException('Asignacion directa no encontrada');

    await this.asignacionPermisoDirectoRepo.remove(existente);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'QUITAR_PERMISO_DIRECTO',
      recurso: 'usuario',
      recursoId: usuarioId,
      datosDespues: { permisoId },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    await this.sesionesService.cerrarTodas(usuarioId);

    return this.policyEngine.getPermisosEfectivos(usuarioId);
  }

  async cerrarSesiones(usuarioId: string, ctx: AccionContexto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    const cantidad = await this.sesionesService.cerrarTodas(usuarioId);

    await this.auditoriaService.registrar({
      usuarioId: ctx.actorId,
      accion: 'CERRAR_TODAS_SESIONES',
      recurso: 'usuario',
      recursoId: usuarioId,
      datosDespues: { cantidad },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    return { ok: true, cantidad };
  }
}
