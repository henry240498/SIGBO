import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaDenuncia, ComunicacionServicio, Denuncia, EvidenciaDenuncia, HistorialEstadoDenuncia, Servicio, TipoServicio, Usuario, Vehiculo } from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { DenunciasController } from './denuncias.controller';
import { DenunciasPublicasController } from './denuncias-publicas.controller';
import { DenunciasService } from './denuncias.service';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Denuncia, CategoriaDenuncia, HistorialEstadoDenuncia, EvidenciaDenuncia, Servicio, TipoServicio, Vehiculo, ComunicacionServicio, Usuario]), SeguridadModule],
  controllers: [DenunciasPublicasController, DenunciasController],
  providers: [DenunciasService, OptionalJwtAuthGuard, RateLimitGuard],
})
export class DenunciasModule {}
