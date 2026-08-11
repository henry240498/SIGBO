import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS_EVENTO = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'];

export class CreateEventoAsistenciaDto {
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;

  @ApiProperty({ description: 'ISO 8601' }) @IsISO8601() fechaInicio: string;

  @ApiProperty({ description: 'ISO 8601' }) @IsISO8601() fechaFin: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() ubicacion?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_EVENTO_ASISTENCIA)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoEventoId?: string;

  @ApiProperty({ required: false, enum: ESTADOS_EVENTO, default: 'PROGRAMADO' })
  @IsOptional()
  @IsIn(ESTADOS_EVENTO)
  estado?: string;
}
