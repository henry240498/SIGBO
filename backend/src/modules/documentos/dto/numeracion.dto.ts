import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, Matches, Max, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

/** Alta/edicion de la configuracion de numeracion de un tipo de
 * documento para un anio (seccion 10 del pedido de Documentos). Upsert
 * por (tipoDocumentoId, anio): si ya existe la fila se actualiza, si
 * no se crea -- nunca se pisa el `ultimoNumero` vigente salvo que el
 * usuario autorizado lo edite explicitamente. */
export class GuardarNumeracionDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_DOCUMENTO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoDocumentoId: string;

  @ApiProperty() @Type(() => Number) @IsInt() anio: number;

  @ApiProperty({ required: false, description: 'Posicion actual (numero ya emitido mas recientemente); solo editable por usuarios autorizados' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  ultimoNumero?: number;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12) mesActual?: number;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() anioDesde?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12) mesDesde?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) numeroDesde?: number;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() anioHasta?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12) mesHasta?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) numeroHasta?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaVigenciaDesde?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaVigenciaHasta?: string;
}
