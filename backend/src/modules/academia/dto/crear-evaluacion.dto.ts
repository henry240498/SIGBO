import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CrearEvaluacionDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_EVALUACION_ACADEMICA)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoEvaluacionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  fecha?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  evaluadorBomberoId?: string;

  @ApiProperty({ required: false, description: 'academia.instructores_externos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  evaluadorExternoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  escala?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
