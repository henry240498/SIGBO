import { Module } from '@nestjs/common';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';

@Module({ controllers: [PublicacionesController], providers: [PublicacionesService] })
export class PublicacionesModule {}
