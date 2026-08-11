import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateSeguroBomberoDto {
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo ASEGURADORA)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  aseguradoraId?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_SEGURO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoSeguroId?: string;

  @ApiProperty({ required: false, description: 'Detalle particular de esta poliza (texto libre)' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() numeroPoliza?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaInicio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaVencimiento?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() documentacionUrl?: string;
}
