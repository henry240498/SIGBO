import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AsignacionRol, Rol, Sesion, Usuario } from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RateLimitGuard } from '../denuncias/guards/rate-limit.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Sesion, AsignacionRol, Rol]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    SeguridadModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RateLimitGuard],
})
export class AuthModule {}
