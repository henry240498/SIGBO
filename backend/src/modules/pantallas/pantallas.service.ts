import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AsignacionRol, Bombero, Cargo, Pantalla, PantallaPermiso, Rango, Rol, Usuario } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ACCIONES_PANTALLA, AccionPantalla, BASE_RBAC, decidir, SujetoUsuario } from './pantallas.logica';
import { GuardarReglaPantallaDto } from './dto/pantallas.dto';

export interface UsuarioConPermisos {
  id: string;
  permisos: string[];
}

export interface ContextoPantallas {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Matriz de permisos por pantalla. Complementa a los permisos por rol: no los reemplaza.
 * Todo se decide ACA, en el backend; la app solo oculta lo que ya sabe que no se puede.
 */
@Injectable()
export class PantallasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** Roles vigentes, rango y cargo de una persona: lo que las reglas de la matriz pueden nombrar. */
  async sujeto(usuarioId: string, ahora = new Date()): Promise<SujetoUsuario> {
    const asignaciones = await this.dataSource.getRepository(AsignacionRol).find({ where: { usuarioId } });
    const rolIds = asignaciones.filter((a) => !a.fechaExpiracion || new Date(a.fechaExpiracion).getTime() > ahora.getTime()).map((a) => a.rolId);
    const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { id: usuarioId } });
    let rangoId: string | null = null;
    let cargo: string | null = null;
    if (usuario?.bomberoId) {
      const b = await this.dataSource.getRepository(Bombero).findOne({ where: { id: usuario.bomberoId } });
      rangoId = b?.rangoId ?? null;
      cargo = b?.cargo ?? null;
    }
    return { usuarioId, rolIds, rangoId, cargo };
  }

  async reglas(codigo?: string): Promise<PantallaPermiso[]> {
    return this.dataSource.getRepository(PantallaPermiso).find({ where: codigo ? { pantallaCodigo: codigo } : {} });
  }

  async decision(user: UsuarioConPermisos, codigo: string, accion: AccionPantalla) {
    const reglas = await this.reglas(codigo);
    // sin reglas para la pantalla no hace falta resolver quien es la persona
    const sujeto = reglas.length ? await this.sujeto(user.id) : { usuarioId: user.id, rolIds: [], rangoId: null, cargo: null };
    return decidir(codigo, accion, user.permisos, reglas, sujeto);
  }

  async permite(user: UsuarioConPermisos, codigo: string, accion: AccionPantalla): Promise<boolean> {
    return (await this.decision(user, codigo, accion)).permitido;
  }

  async exigir(user: UsuarioConPermisos, codigo: string, accion: AccionPantalla): Promise<void> {
    if (await this.permite(user, codigo, accion)) return;
    const p = await this.dataSource.getRepository(Pantalla).findOne({ where: { codigo } });
    throw new ForbiddenException(`No tenés permiso para ${verbo(accion)} en «${p?.nombre ?? codigo}».`);
  }

  /** Que puede hacer la persona en cada pantalla (lo que la app usa para ocultar, y la persona para entender). */
  async misPermisos(user: UsuarioConPermisos) {
    const pantallas = await this.dataSource.getRepository(Pantalla).find({ where: { activa: true } });
    const reglas = await this.reglas();
    const sujeto = reglas.length ? await this.sujeto(user.id) : { usuarioId: user.id, rolIds: [], rangoId: null, cargo: null };
    return pantallas
      .sort((a, b) => a.codigo.localeCompare(b.codigo))
      .map((p) => {
        const permisos = Object.fromEntries(ACCIONES_PANTALLA.map((a) => [a, decidir(p.codigo, a, user.permisos, reglas, sujeto).permitido])) as Record<AccionPantalla, boolean>;
        return { codigo: p.codigo, nombre: p.nombre, confidencialAplica: p.confidencialAplica, ...permisos, definida: !!BASE_RBAC[p.codigo] };
      });
  }

  // ------------------------------------------------------------ administracion

  async listarPantallas() {
    return (await this.dataSource.getRepository(Pantalla).find({ order: { codigo: 'ASC' } })).map((p) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion,
      confidencialAplica: p.confidencialAplica,
      activa: p.activa,
    }));
  }

  async listarReglas(codigo?: string) {
    return (await this.reglas(codigo)).map((r) => ({ ...r }));
  }

  /** Lo que se puede elegir como sujeto de una regla. */
  async sujetos() {
    const [roles, rangos, cargos, usuarios] = await Promise.all([
      this.dataSource.getRepository(Rol).find({ where: { activo: true } }),
      this.dataSource.getRepository(Rango).find({ where: { estado: 'ACTIVO' } }),
      this.dataSource.getRepository(Cargo).find({}),
      this.dataSource.getRepository(Usuario).find({ where: { estado: 'ACTIVO' } }),
    ]);
    return {
      roles: roles.map((r) => ({ id: r.id, nombre: r.nombre })),
      rangos: rangos.map((r) => ({ id: r.id, nombre: r.nombre })),
      cargos: [...new Set(cargos.map((c) => (c as { nombre?: string }).nombre).filter((n): n is string => !!n))].sort().map((n) => ({ id: n, nombre: n })),
      usuarios: usuarios.map((u) => ({ id: u.id, nombre: u.username })),
    };
  }

  async guardarRegla(dto: GuardarReglaPantallaDto, ctx: ContextoPantallas, ahora = new Date()) {
    const pantalla = await this.dataSource.getRepository(Pantalla).findOne({ where: { codigo: dto.pantallaCodigo } });
    if (!pantalla) throw new NotFoundException('La pantalla no existe.');
    if (dto.confidencial && !pantalla.confidencialAplica) {
      // no se rechaza: queda como estaba, pero se avisa en el nombre de la accion auditada
    }
    const repo = this.dataSource.getRepository(PantallaPermiso);
    const previa = await repo.findOne({ where: { pantallaCodigo: dto.pantallaCodigo, sujetoTipo: dto.sujetoTipo, sujetoId: dto.sujetoId } });
    const datos = { ver: dto.ver, crear: dto.crear, editar: dto.editar, eliminar: dto.eliminar, confidencial: dto.confidencial, denegar: dto.denegar };
    let guardada: PantallaPermiso;
    if (previa) {
      await repo.update({ id: previa.id }, { ...datos, actualizadoEn: ahora });
      guardada = { ...previa, ...datos, actualizadoEn: ahora };
    } else {
      guardada = await repo.save(
        repo.create({ pantallaCodigo: dto.pantallaCodigo, sujetoTipo: dto.sujetoTipo, sujetoId: dto.sujetoId, ...datos, creadoPor: ctx.usuarioId, actualizadoEn: ahora }),
      );
    }
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'CAMBIAR_PERMISO_PANTALLA',
      recurso: 'seguridad.pantalla_permisos',
      recursoId: guardada.id,
      datosAntes: previa ? { ver: previa.ver, crear: previa.crear, editar: previa.editar, eliminar: previa.eliminar, confidencial: previa.confidencial, denegar: previa.denegar } : undefined,
      datosDespues: { pantalla: dto.pantallaCodigo, sujeto: `${dto.sujetoTipo}:${dto.sujetoId}`, ...datos },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return guardada;
  }

  async eliminarRegla(id: string, ctx: ContextoPantallas) {
    const repo = this.dataSource.getRepository(PantallaPermiso);
    const previa = await repo.findOne({ where: { id } });
    if (!previa) throw new NotFoundException('La regla no existe.');
    await repo.delete({ id });
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'QUITAR_PERMISO_PANTALLA',
      recurso: 'seguridad.pantalla_permisos',
      recursoId: id,
      datosAntes: { pantalla: previa.pantallaCodigo, sujeto: `${previa.sujetoTipo}:${previa.sujetoId}` },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return { ok: true };
  }
}

function verbo(a: AccionPantalla): string {
  return { ver: 'ver', crear: 'crear', editar: 'editar', eliminar: 'eliminar', confidencial: 'ver información confidencial' }[a];
}
