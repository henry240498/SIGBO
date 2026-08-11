import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class AsignarBomberoGuardiaDto {
  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() rol?: string;
}
