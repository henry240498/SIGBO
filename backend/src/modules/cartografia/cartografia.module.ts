import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { CartografiaController } from './cartografia.controller';
import { CartografiaService } from './cartografia.service';

@Module({
  imports: [SeguridadModule],
  controllers: [CartografiaController],
  providers: [CartografiaService],
})
export class CartografiaModule {}
