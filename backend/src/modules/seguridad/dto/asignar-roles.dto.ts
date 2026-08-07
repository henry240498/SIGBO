import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class AsignarRolesDto {
  @ApiProperty({ type: [String], description: 'Conjunto completo de roles que tendra el usuario' })
  @IsArray()
  @Matches(GUID_REGEX, { each: true, message: GUID_REGEX_MENSAJE })
  rolesIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}
