import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaEquipo, Equipo, PrestamoEquipo } from '../../shared/entities';
import { CategoriasEquipoService } from './categorias-equipo.service';
import { CategoriasEquipoController } from './categorias-equipo.controller';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { EquipamientoBomberoService } from './equipamiento-bombero.service';
import { EquipamientoBomberoController } from './equipamiento-bombero.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaEquipo, Equipo, PrestamoEquipo])],
  controllers: [CategoriasEquipoController, EquiposController, EquipamientoBomberoController],
  providers: [CategoriasEquipoService, EquiposService, EquipamientoBomberoService],
  exports: [EquiposService, CategoriasEquipoService],
})
export class EquiposModule {}
