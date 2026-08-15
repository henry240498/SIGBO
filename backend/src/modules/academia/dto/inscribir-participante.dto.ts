import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
import { ParticipanteExternoAcademiaDto } from './participante-externo-academia.dto';

/** Exactamente uno de los dos debe venir: `bomberoId` (personal existente,
 * recuperado de Personal sin reescribir sus datos) o `externo` (persona
 * ajena a la institucion, misma logica que Asistencia -- seccion 7-8). */
export class InscribirParticipanteDto {
  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId?: string;

  @ApiProperty({ required: false, type: ParticipanteExternoAcademiaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ParticipanteExternoAcademiaDto)
  externo?: ParticipanteExternoAcademiaDto;
}
