import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { LlamadosController } from './llamados.controller';
import { LlamadosService } from './llamados.service';

@Module({
  imports: [SeguridadModule],
  controllers: [LlamadosController],
  providers: [LlamadosService],
})
export class LlamadosModule {}
