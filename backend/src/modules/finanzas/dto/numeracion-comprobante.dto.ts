import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsOptional, IsString, Matches, Min, MaxLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateNumeracionComprobanteDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_DOCUMENTO_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoComprobanteId: string;

  @ApiProperty() @IsString() @MaxLength(3) establecimiento: string;
  @ApiProperty() @IsString() @MaxLength(3) puntoExpedicion: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(10) serie?: string;
  @ApiProperty() @IsString() @MaxLength(20) timbrado: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) numeracionDesde: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) numeracionHasta: number;
  @ApiProperty() @IsISO8601() vigenciaDesde: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() vigenciaHasta?: string;
}
