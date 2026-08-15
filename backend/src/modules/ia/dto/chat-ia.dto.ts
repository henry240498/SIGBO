import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class ChatIaDto {
  @ApiProperty({ description: 'Pregunta o mensaje del usuario' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  mensaje: string;

  @ApiProperty({ required: false, description: 'Id de una conversacion existente para continuarla; si se omite se crea una nueva' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  conversacionId?: string;
}
