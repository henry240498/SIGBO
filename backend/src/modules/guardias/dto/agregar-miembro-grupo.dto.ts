import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ROLES = ['TITULAR', 'CHOFER'];

export class AgregarMiembroGrupoDto {
  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ required: false, enum: ROLES, default: 'TITULAR' }) @IsOptional() @IsIn(ROLES) rol?: string;

  @ApiProperty({ required: false, default: 0 }) @IsOptional() @IsInt() orden?: number;
}
