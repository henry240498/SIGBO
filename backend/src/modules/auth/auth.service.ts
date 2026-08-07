import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AsignacionRol, Rol, Sesion, Usuario } from '../../shared/entities';
import { PolicyEngineService } from '../seguridad/policy-engine.service';
import { AuditoriaService } from '../seguridad/auditoria.service';

const MAX_INTENTOS_FALLIDOS = 5;
const BLOQUEO_MINUTOS = 15;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    email: string;
    username: string;
    roles: string[];
    permisos: string[];
    debeCambiarPassword: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sesion) private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(AsignacionRol) private readonly asignacionRolRepo: Repository<AsignacionRol>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    private readonly jwtService: JwtService,
    private readonly policyEngine: PolicyEngineService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async login(
    usernameOrEmail: string,
    password: string,
    ip?: string,
    userAgent?: string,
  ): Promise<LoginResult> {
    const usuario = await this.usuarioRepo
      .createQueryBuilder('u')
      .where('u.username = :val OR u.email = :val', { val: usernameOrEmail })
      .getOne();

    if (!usuario) {
      await this.auditoriaService.registrar({
        usuarioId: null,
        accion: 'LOGIN_FALLIDO',
        recurso: 'auth',
        datosDespues: { usernameOrEmail, motivo: 'usuario no encontrado' },
        ip,
        userAgent,
      });
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException(
        `Cuenta bloqueada temporalmente por intentos fallidos. Reintente despues de ${usuario.bloqueadoHasta.toLocaleTimeString('es-PY')}`,
      );
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException(`Cuenta en estado ${usuario.estado}`);
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      await this.registrarIntentoFallido(usuario);
      await this.auditoriaService.registrar({
        usuarioId: usuario.id,
        accion: 'LOGIN_FALLIDO',
        recurso: 'auth',
        recursoId: usuario.id,
        datosDespues: { motivo: 'password incorrecta' },
        ip,
        userAgent,
      });
      throw new UnauthorizedException('Credenciales invalidas');
    }

    await this.usuarioRepo.update(usuario.id, {
      intentosFallidos: 0,
      bloqueadoHasta: null,
      ultimoAcceso: new Date(),
      ipUltimoAcceso: ip ?? null,
      userAgent: userAgent ?? null,
    });

    await this.auditoriaService.registrar({
      usuarioId: usuario.id,
      accion: 'LOGIN',
      recurso: 'auth',
      recursoId: usuario.id,
      ip,
      userAgent,
    });

    return this.emitirTokens(usuario, ip, userAgent);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: { sub: string; sid: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }

    const sesion = await this.sesionRepo.findOne({ where: { id: payload.sid } });
    if (!sesion || !sesion.activa || sesion.usuarioId !== payload.sub) {
      throw new UnauthorizedException('Sesion invalida');
    }

    const coincide = await bcrypt.compare(refreshToken, sesion.refreshTokenHash);
    if (!coincide) {
      throw new UnauthorizedException('Sesion invalida');
    }

    const usuario = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario no disponible');
    }

    await this.sesionRepo.update(sesion.id, { fechaUltimaActividad: new Date() });

    const { roles, permisos } = await this.getRolesYPermisos(usuario.id);
    const accessToken = this.firmarAccessToken(usuario, roles, permisos);
    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<{ sid: string; sub: string }>(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      await this.sesionRepo.update(payload.sid, { activa: false });
      await this.auditoriaService.registrar({
        usuarioId: payload.sub,
        accion: 'LOGOUT',
        recurso: 'auth',
        recursoId: payload.sub,
      });
    } catch {
      // token ya invalido o expirado: no hay nada que cerrar
    }
  }

  private async registrarIntentoFallido(usuario: Usuario): Promise<void> {
    const intentos = usuario.intentosFallidos + 1;
    const bloqueadoHasta =
      intentos >= MAX_INTENTOS_FALLIDOS
        ? new Date(Date.now() + BLOQUEO_MINUTOS * 60 * 1000)
        : null;
    await this.usuarioRepo.update(usuario.id, { intentosFallidos: intentos, bloqueadoHasta });
  }

  private async getRolesYPermisos(usuarioId: string): Promise<{ roles: string[]; permisos: string[] }> {
    const asignaciones = await this.asignacionRolRepo.find({ where: { usuarioId } });
    const rolIds = asignaciones.map((a) => a.rolId);
    const roles =
      rolIds.length > 0
        ? (await this.rolRepo.createQueryBuilder('r').where('r.id IN (:...ids)', { ids: rolIds }).getMany()).map(
            (r) => r.nombre,
          )
        : [];
    const permisos = await this.policyEngine.getPermisosEfectivos(usuarioId);
    return { roles, permisos };
  }

  private firmarAccessToken(usuario: Usuario, roles: string[], permisos: string[]): string {
    return this.jwtService.sign(
      {
        sub: usuario.id,
        email: usuario.email,
        username: usuario.username,
        roles,
        permisos,
      },
      { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRATION ?? '1h' },
    );
  }

  private async emitirTokens(usuario: Usuario, ip?: string, userAgent?: string): Promise<LoginResult> {
    const { roles, permisos } = await this.getRolesYPermisos(usuario.id);
    const accessToken = this.firmarAccessToken(usuario, roles, permisos);

    const sesion = await this.sesionRepo.save(
      this.sesionRepo.create({
        usuarioId: usuario.id,
        refreshTokenHash: 'pendiente',
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activa: true,
      }),
    );

    const refreshToken = this.jwtService.sign(
      { sub: usuario.id, sid: sesion.id },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION ?? '7d',
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.sesionRepo.update(sesion.id, { refreshTokenHash });

    const passwordExpirada = usuario.passwordExpiraEn ? usuario.passwordExpiraEn < new Date() : false;

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        username: usuario.username,
        roles,
        permisos,
        debeCambiarPassword: usuario.debeCambiarPassword || passwordExpirada,
      },
    };
  }
}
