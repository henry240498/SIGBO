import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_PARAMETRO = [
  'PAIS',
  'DEPARTAMENTO',
  'CIUDAD',
  'BARRIO',
  'PROFESION',
  'IDIOMA',
  'NIVEL_IDIOMA',
  'GRUPO_SANGUINEO',
  'FACTOR_RH',
  'TIPO_SEGURO',
  'ASEGURADORA',
];

export class CreateParametroDto {
  @ApiProperty({ enum: TIPOS_PARAMETRO })
  @IsIn(TIPOS_PARAMETRO)
  tipo: string;

  @ApiProperty({ required: false, description: 'Id de otro parametro (jerarquia geografica)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  padreId?: string;

  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() orden?: number;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'] })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}
