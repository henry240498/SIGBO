import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
import { ParticipanteExternoDto } from './participante-externo.dto';

/** Exactamente uno de los dos debe venir: `bomberoId` (personal existente) o
 * `externo` (datos de una persona ajena al cuerpo de bomberos, seccion 7-8). */
export class AgregarParticipanteDto {
  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId?: string;

  @ApiProperty({ required: false, type: ParticipanteExternoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ParticipanteExternoDto)
  externo?: ParticipanteExternoDto;
}
