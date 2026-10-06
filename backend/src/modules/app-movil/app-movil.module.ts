import { Module } from '@nestjs/common';
import { AppMovilController } from './app-movil.controller';
import { AppMovilService } from './app-movil.service';

@Module({
  controllers: [AppMovilController],
  providers: [AppMovilService],
})
export class AppMovilModule {}
