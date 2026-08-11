import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsNumber, IsString, Max, Min } from 'class-validator';

const ESTADOS_PARTICIPACION = ['COMPLETA', 'PARCIAL', 'NO_REGISTRADA', 'AUSENTE_CONFIRMADO'];

/** Registro/edicion manual de la participacion de una persona en un evento
 * (seccion 19: el encargado autorizado puede registrar asistencia manual). */
export class ActualizarParticipacionDto {
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() horaRealInicio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() horaRealFin?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeParticipacion?: number;

  @ApiProperty({ required: false, enum: ESTADOS_PARTICIPACION })
  @IsOptional()
  @IsIn(ESTADOS_PARTICIPACION)
  estadoParticipacion?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
