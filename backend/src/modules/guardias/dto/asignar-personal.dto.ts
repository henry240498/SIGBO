import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_PARTICIPACION = ['TITULAR', 'REFUERZO', 'REEMPLAZO'];

export class AsignarPersonalDto {
  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ required: false, description: 'p.ej. OFICIAL_A_CARGO, CHOFER, o libre' })
  @IsOptional()
  @IsString()
  rol?: string;

  @ApiProperty({ required: false, enum: TIPOS_PARTICIPACION, default: 'TITULAR' })
  @IsOptional()
  @IsIn(TIPOS_PARTICIPACION)
  tipoParticipacion?: string;

  @ApiProperty({ required: false, description: 'operaciones.asignacion_guardias.id a quien reemplaza (solo si tipoParticipacion=REEMPLAZO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  reemplazaAsignacionId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}
