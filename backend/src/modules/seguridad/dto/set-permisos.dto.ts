import { ApiProperty } from '@nestjs/swagger';
import { IsArray, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class SetPermisosDto {
  @ApiProperty({ type: [String], description: 'Conjunto completo de permisos que tendra el rol' })
  @IsArray()
  @Matches(GUID_REGEX, { each: true, message: GUID_REGEX_MENSAJE })
  permisosIds: string[];
}
