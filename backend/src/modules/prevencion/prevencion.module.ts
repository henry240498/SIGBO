import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { PrevencionController } from './prevencion.controller';
import { PrevencionService } from './prevencion.service';

@Module({
  imports: [SeguridadModule],
  controllers: [PrevencionController],
  providers: [PrevencionService],
})
export class PrevencionModule {}
