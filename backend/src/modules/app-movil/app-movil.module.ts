import { Module } from '@nestjs/common';
import { AppMovilController } from './app-movil.controller';
import { AppMovilService } from './app-movil.service';

@Module({
  controllers: [AppMovilController],
  providers: [AppMovilService],
  exports: [AppMovilService],
})
export class AppMovilModule {}
