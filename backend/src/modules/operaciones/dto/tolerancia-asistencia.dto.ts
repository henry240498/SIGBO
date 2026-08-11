import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class ToleranciaAsistenciaDto {
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_EVENTO_ASISTENCIA); vacio = regla general' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoEventoId?: string;

  @ApiProperty() @IsInt() @Min(0) minutosToleranciaEntrada: number;
  @ApiProperty() @IsInt() @Min(0) minutosToleranciaSalida: number;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}
