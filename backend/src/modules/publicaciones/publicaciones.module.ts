import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bombero,Servicio,TipoServicio,Vehiculo } from '../../shared/entities';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
@Module({imports:[TypeOrmModule.forFeature([Servicio,TipoServicio,Bombero,Vehiculo])],controllers:[PublicacionesController],providers:[PublicacionesService]})
export class PublicacionesModule{}
