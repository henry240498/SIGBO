import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class RegistrarMarcacionDto {
  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ enum: ['ENTRADA', 'SALIDA'] })
  @IsIn(['ENTRADA', 'SALIDA'])
  tipoMarcacion: string;

  @ApiProperty({ required: false, description: 'ISO 8601, por defecto ahora' })
  @IsOptional()
  @IsISO8601()
  timestampMarcacion?: string;

  @ApiProperty({ required: false, description: 'operaciones.eventos_asistencia.id (opcional)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  eventoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
  @ApiProperty({ required: false, description: 'Motivo cuando se registra manualmente' })
  @IsOptional()
  @IsString()
  motivo?: string;
}
