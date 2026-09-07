import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

/** Nunca recibe texto libre del cliente (ver comentario en
 * `PiperService`/`ia-voz.controller.ts`): solo el id de un mensaje que
 * `IaChatService` YA guardo, para que Piper solo pueda leer en voz alta
 * algo que Snoopy realmente dijo -- nunca cualquier texto que alguien
 * quiera hacerle "decir" a la mascota institucional. */
export class HablarVozDto {
  @ApiProperty({ description: 'Id de un mensaje de Snoopy (rol IA) ya guardado en una conversación propia' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  mensajeId: string;
}
