import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { AsignacionRol, Rol, Sesion, Usuario } from '../../shared/entities';
import { PolicyEngineService } from '../seguridad/policy-engine.service';
import { AuditoriaService } from '../seguridad/auditoria.service';

const MAX_INTENTOS_FALLIDOS = 5;
const BLOQUEO_MINUTOS = 15;

function secretoRequerido(nombre: 'JWT_SECRET' | 'REFRESH_TOKEN_SECRET'): string {
  const valor = process.env[nombre]?.trim();
  if (!valor || valor.length < 32) {
    throw new Error(`${nombre} debe estar definido y tener al menos 32 caracteres.`);
  }
  return valor;
}

function expiracionJwt(nombre: 'JWT_EXPIRATION' | 'REFRESH_TOKEN_EXPIRATION', predeterminado: StringValue): StringValue {
  const valor = process.env[nombre]?.trim();
  if (!valor) return predeterminado;
  if (!/^[1-9]\d*(?:ms|s|m|h|d|w|y)$/.test(valor)) {
    throw new Error(`${nombre} debe usar una duración positiva, por ejemplo "15m", "1h" o "7d".`);
  }
  return valor as StringValue;
}

export function duracionEnMilisegundos(
  nombre: 'JWT_EXPIRATION' | 'REFRESH_TOKEN_EXPIRATION',
  predeterminado: StringValue,
): number {
  const valor = expiracionJwt(nombre, predeterminado);
  const coincidencia = /^([1-9]\d*)(ms|s|m|h|d|w|y)$/.exec(valor);
  if (!coincidencia) throw new Error(`${nombre} tiene una duración inválida.`);
  const cantidad = Number(coincidencia[1]);
  const multiplicadores: Record<string, number> = {
    ms: 1, s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000, y: 31_536_000_000,
  };
  const resultado = cantidad * multiplicadores[coincidencia[2]];
  if (!Number.isSafeInteger(resultado)) throw new Error(`${nombre} supera la duración admitida.`);
  return resultado;
}

export function validarConfiguracionAuth(): void {
  secretoRequerido('JWT_SECRET');
  secretoRequerido('REFRESH_TOKEN_SECRET');
  expiracionJwt('JWT_EXPIRATION', '15m');
  duracionEnMilisegundos('REFRESH_TOKEN_EXPIRATION', '7d');
}

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

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    usuario: LoginResult['usuario'];
  }> {
    let payload: { sub: string; sid: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: secretoRequerido('REFRESH_TOKEN_SECRET') });
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }

    const sesion = await this.sesionRepo.findOne({ where: { id: payload.sid } });
    if (!sesion || !sesion.activa || sesion.usuarioId !== payload.sub) {
      throw new UnauthorizedException('Sesion invalida');
    }
    if (!sesion.fechaExpiracion || sesion.fechaExpiracion <= new Date()) {
      await this.sesionRepo.update(sesion.id, { activa: false });
      throw new UnauthorizedException('Sesion expirada');
    }

    const coincide = await bcrypt.compare(refreshToken, sesion.refreshTokenHash);
    if (!coincide) {
      throw new UnauthorizedException('Sesion invalida');
    }

    const usuario = await this.usuarioRepo.findOne({ where: { id: payload.sub } });
    if (!usuario || usuario.estado !== 'ACTIVO') {
      throw new UnauthorizedException('Usuario no disponible');
    }

    const { roles, permisos } = await this.getRolesYPermisos(usuario.id);
    const accessToken = this.firmarAccessToken(usuario, roles, permisos, sesion.id);
    const nuevoRefreshToken = this.firmarRefreshToken(usuario.id, sesion.id);
    const actualizacion = await this.sesionRepo.update({
      id: sesion.id,
      activa: true,
      refreshTokenHash: sesion.refreshTokenHash,
    }, {
      fechaUltimaActividad: new Date(),
      refreshTokenHash: await bcrypt.hash(nuevoRefreshToken, 10),
    });
    // Compare-and-swap: dos refresh simultáneos no pueden emitir dos pares de
    // credenciales válidas a partir del mismo token anterior.
    if (actualizacion.affected !== 1) {
      throw new UnauthorizedException('La sesión fue renovada en otro dispositivo o pestaña');
    }
    const passwordExpirada = usuario.passwordExpiraEn ? usuario.passwordExpiraEn < new Date() : false;
    return {
      accessToken,
      refreshToken: nuevoRefreshToken,
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

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<{ sid: string; sub: string }>(refreshToken, {
        secret: secretoRequerido('REFRESH_TOKEN_SECRET'),
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

  private firmarAccessToken(usuario: Usuario, roles: string[], permisos: string[], sesionId: string): string {
    return this.jwtService.sign(
      {
        sub: usuario.id,
        email: usuario.email,
        username: usuario.username,
        roles,
        permisos,
        sid: sesionId,
      },
      { secret: secretoRequerido('JWT_SECRET'), expiresIn: expiracionJwt('JWT_EXPIRATION', '15m') },
    );
  }

  private firmarRefreshToken(usuarioId: string, sesionId: string): string {
    return this.jwtService.sign(
      { sub: usuarioId, sid: sesionId },
      {
        secret: secretoRequerido('REFRESH_TOKEN_SECRET'),
        expiresIn: expiracionJwt('REFRESH_TOKEN_EXPIRATION', '7d'),
      },
    );
  }

  private async emitirTokens(usuario: Usuario, ip?: string, userAgent?: string): Promise<LoginResult> {
    const sesion = await this.sesionRepo.save(
      this.sesionRepo.create({
        usuarioId: usuario.id,
        refreshTokenHash: 'pendiente',
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        fechaExpiracion: new Date(Date.now() + duracionEnMilisegundos('REFRESH_TOKEN_EXPIRATION', '7d')),
        activa: true,
      }),
    );

    const { roles, permisos } = await this.getRolesYPermisos(usuario.id);
    const accessToken = this.firmarAccessToken(usuario, roles, permisos, sesion.id);
    const refreshToken = this.firmarRefreshToken(usuario.id, sesion.id);

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
