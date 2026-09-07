import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../../shared/utils/guid';

const LAT_MIN = -90;
const LAT_MAX = 90;
const LON_MIN = -180;
const LON_MAX = 180;

export const TIPOS_EVENTO_SEGUIMIENTO = [
  'SALIDA_CUARTEL', 'LLEGADA_SERVICIO', 'SALIDA_SERVICIO', 'LLEGADA_CENTRO_SALUD',
  'SALIDA_CENTRO_SALUD', 'REGRESO_CUARTEL', 'FIN_SERVICIO', 'PUNTO_CONTROL',
  'GPS', 'INCIDENTE', 'OBSERVACION', 'OTRO',
] as const;

export class PuntoRutaDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(0) orden: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(LAT_MIN) @Max(LAT_MAX) lat: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(LON_MIN) @Max(LON_MAX) lon: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) etiqueta?: string;
}

export class GuardarRutaPlanificadaDto {
  @ApiProperty({ type: [PuntoRutaDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'La ruta planificada necesita al menos 2 puntos' })
  @ValidateNested({ each: true })
  @Type(() => PuntoRutaDto)
  puntos: PuntoRutaDto[];
}

export class CrearEventoGeograficoDto {
  @ApiProperty({ enum: TIPOS_EVENTO_SEGUIMIENTO }) @IsIn(TIPOS_EVENTO_SEGUIMIENTO) tipoEvento: (typeof TIPOS_EVENTO_SEGUIMIENTO)[number];
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(LAT_MIN) @Max(LAT_MAX) latitud: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(LON_MIN) @Max(LON_MAX) longitud: number;

  @ApiProperty({ required: false, description: 'organizacion.parametros no aplica aca -- es un movil de vehiculos.vehiculos' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  movilId?: string;

  @ApiProperty({ required: false, description: 'Etiqueta/destino descriptivo, ej. nombre del centro de salud' })
  @IsOptional() @IsString() @MaxLength(200)
  destino?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(2000) observacion?: string;
}

export class ActualizarEventoGeograficoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) destino?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(2000) observacion?: string;
}

export class CrearPruebaComunicacionDto {
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(LAT_MIN) @Max(LAT_MAX) latitud: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(LON_MIN) @Max(LON_MAX) longitud: number;

  @ApiProperty({ minimum: 1, maximum: 5, description: '1 = muy malo ... 5 = muy bueno. Nunca 0.' })
  @Type(() => Number) @IsInt() @Min(1) @Max(5)
  nivel: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  movilId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(2000) observacion?: string;
}

export class ActualizarPruebaComunicacionDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(2000) observacion?: string;
}
