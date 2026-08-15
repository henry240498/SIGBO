import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS_INSCRIPCION = ['INSCRITO', 'ACTIVO', 'RETIRADO', 'FINALIZADO'];

/** El resultado final es SIEMPRE una decision explicita de quien corresponda
 * (instructor/evaluador) -- nunca se infiere solo por inscribirse o asistir
 * (seccion 14 del pedido). */
export class ActualizarInscripcionDto {
  @ApiProperty({ required: false, enum: ESTADOS_INSCRIPCION })
  @IsOptional()
  @IsIn(ESTADOS_INSCRIPCION)
  estado?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo RESULTADO_ACADEMICO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  resultadoFinalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
