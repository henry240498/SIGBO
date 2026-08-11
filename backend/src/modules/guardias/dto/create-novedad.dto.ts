import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateNovedadDto {
  @ApiProperty() @IsString() @IsNotEmpty() texto: string;
  @ApiProperty({ required: false, description: 'ISO 8601, por defecto ahora' }) @IsOptional() @IsString() fechaHora?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id del autor, si corresponde' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId?: string;
}
