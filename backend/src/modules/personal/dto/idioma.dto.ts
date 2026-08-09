import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class IdiomaDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo IDIOMA)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  idiomaId: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo NIVEL_IDIOMA)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  nivelIdiomaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificacion?: string;
}

export class SetIdiomasDto {
  @ApiProperty({ type: [IdiomaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdiomaDto)
  idiomas: IdiomaDto[];
}
