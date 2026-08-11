import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionValor, ConfiguracionVersion } from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ConfiguracionController } from './configuracion.controller';
import { ConfiguracionService } from './configuracion.service';

@Module({imports:[TypeOrmModule.forFeature([ConfiguracionValor,ConfiguracionVersion]),SeguridadModule],controllers:[ConfiguracionController],providers:[ConfiguracionService],exports:[ConfiguracionService]})
export class ConfiguracionModule{}
