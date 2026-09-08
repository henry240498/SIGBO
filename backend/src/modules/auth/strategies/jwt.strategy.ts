import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../types/authenticated-user';
import { extraerAccessToken } from '../auth-cookies';
import { Sesion } from '../../../shared/entities';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  roles: string[];
  permisos: string[];
  sid: string;
}

function jwtSecret(): string {
  const valor = process.env.JWT_SECRET?.trim();
  if (!valor || valor.length < 32) {
    throw new Error('JWT_SECRET debe estar definido y tener al menos 32 caracteres.');
  }
  return valor;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@InjectRepository(Sesion) private readonly sesionRepo: Repository<Sesion>) {
    super({
      jwtFromRequest: (request) => extraerAccessToken(request),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sid) throw new UnauthorizedException('Sesion no vinculada');
    const sesion = await this.sesionRepo.findOne({ where: { id: payload.sid } });
    if (!sesion || !sesion.activa || sesion.usuarioId !== payload.sub || !sesion.fechaExpiracion || sesion.fechaExpiracion <= new Date()) {
      throw new UnauthorizedException('Sesion invalida o expirada');
    }
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
      permisos: payload.permisos,
    };
  }
}
