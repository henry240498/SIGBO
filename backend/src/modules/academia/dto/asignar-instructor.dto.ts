import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
import { InstructorExternoDto } from './instructor-externo.dto';

const ROLES_INSTRUCTOR = ['PRINCIPAL', 'AYUDANTE'];

/** Exactamente uno de los dos debe venir: `bomberoId` (personal existente,
 * seccion 6) o `externo` (persona ajena a la institucion, seccion 6). */
export class AsignarInstructorDto {
  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId?: string;

  @ApiProperty({ required: false, type: InstructorExternoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InstructorExternoDto)
  externo?: InstructorExternoDto;

  @ApiProperty({ required: false, enum: ROLES_INSTRUCTOR, default: 'PRINCIPAL' })
  @IsOptional()
  @IsIn(ROLES_INSTRUCTOR)
  rolInstructor?: string;
}
