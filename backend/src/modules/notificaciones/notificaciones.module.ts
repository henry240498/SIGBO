import { Global, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';

/** Avisos externos opcionales. Global para que cualquier modulo pueda pedirlos sin importar nada. */
@Global()
@Module({
  providers: [TelegramService],
  exports: [TelegramService],
})
export class NotificacionesModule {}
