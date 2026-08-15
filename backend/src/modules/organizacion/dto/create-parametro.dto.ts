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
  // Estos 4 ya existian en el enum de la entidad y en la restriccion CHECK
  // de la base, pero faltaban aca -- creaba un parametro de estos tipos
  // fallaba la validacion del DTO aunque la base lo permitia.
  'TIPO_EVENTO_ASISTENCIA',
  'UBICACION_EQUIPO',
  'ESTADO_PRESENCIA_GUARDIA',
  'SECTOR_ESTACION',
  // Modulo Academia
  'TIPO_ACTIVIDAD_ACADEMICA',
  'MODALIDAD_ACADEMICA',
  'TIPO_EVALUACION_ACADEMICA',
  'RESULTADO_ACADEMICO',
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
