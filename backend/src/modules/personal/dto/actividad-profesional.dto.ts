import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class ActividadProfesionalDto {
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo PROFESION)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  profesionId?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cargoLaboral?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  experiencia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  actividadesRelacionadas?: string;
}
