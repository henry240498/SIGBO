import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

/** El resultado de una evaluacion puntual es distinto del resultado final
 * de la actividad (InscripcionActividadAcademica.resultadoFinalId) -- una
 * nota individual no aprueba por si sola la actividad completa. */
export class RegistrarNotaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  calificacion?: number;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo RESULTADO_ACADEMICO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  resultadoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
