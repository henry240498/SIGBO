import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export class CrearInstalacionDto {
  @recortar() @IsString() @MinLength(2) @MaxLength(100) nombre!: string;
  @IsOptional() @IsInt() @Min(1) @Max(100000) capacidad?: number;
  @IsOptional() @opcional() @IsString() @MaxLength(500) descripcion?: string;
}

export class ActualizarInstalacionDto {
  @IsOptional() @recortar() @IsString() @MinLength(2) @MaxLength(100) nombre?: string;
  @IsOptional() @IsInt() @Min(1) @Max(100000) capacidad?: number;
  @IsOptional() @opcional() @IsString() @MaxLength(500) descripcion?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class SolicitarReservaDto {
  @IsUUID() instalacionId!: string;
  @recortar() @IsString() @MinLength(3) @MaxLength(150) titulo!: string;
  @recortar() @IsString() @MinLength(2) @MaxLength(150) solicitanteNombre!: string;
  @IsDateString() inicio!: string;
  @IsDateString() fin!: string;
  @IsOptional() @opcional() @IsString() @MaxLength(100) contacto?: string;
  @IsOptional() @IsInt() @Min(1) @Max(100000) personas?: number;
}

export class DecidirReservaDto {
  @IsEnum(['APROBAR', 'RECHAZAR'] as const) decision!: 'APROBAR' | 'RECHAZAR';
  @IsOptional() @opcional() @IsString() @MaxLength(500) motivo?: string;
}

export class CancelarReservaDto {
  @IsOptional() @opcional() @IsString() @MaxLength(500) motivo?: string;
}
