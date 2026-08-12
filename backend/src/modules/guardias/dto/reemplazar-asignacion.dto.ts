import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class ReemplazarAsignacionDto {
  @ApiProperty({ description: 'personal.bomberos.id de quien reemplaza' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoNuevoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}
