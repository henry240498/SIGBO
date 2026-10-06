import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [SeguridadModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
