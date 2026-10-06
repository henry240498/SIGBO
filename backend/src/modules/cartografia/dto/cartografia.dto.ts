import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const texto = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));
const texto$ = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CrearHidranteDto {
  @texto$() @IsString() @MinLength(1) @MaxLength(30) codigo!: string;
  @texto$() @IsString() @MinLength(3) @MaxLength(300) direccion!: string;
  @IsLatitude() latitud!: number;
  @IsLongitude() longitud!: number;
  @IsOptional() @texto() @IsString() @MaxLength(40) tipo?: string;
  @IsOptional() @texto() @IsString() @MaxLength(300) referencia?: string;
  @IsOptional() @IsEnum(['OPERATIVO', 'FUERA_SERVICIO', 'SIN_VERIFICAR'] as const)
  estado?: 'OPERATIVO' | 'FUERA_SERVICIO' | 'SIN_VERIFICAR';
  @IsOptional() @IsInt() @Min(0) @Max(100000) caudalLpm?: number;
  @IsOptional() @IsDateString() ultimaInspeccion?: string;
  @IsOptional() @texto() @IsString() @MaxLength(500) observaciones?: string;
}

/** Todos los campos opcionales: se cambia solo lo que llega. `activo:false` da de baja. */
export class ActualizarHidranteDto {
  @IsOptional() @texto$() @IsString() @MinLength(3) @MaxLength(300) direccion?: string;
  @IsOptional() @IsLatitude() latitud?: number;
  @IsOptional() @IsLongitude() longitud?: number;
  @IsOptional() @texto() @IsString() @MaxLength(40) tipo?: string;
  @IsOptional() @texto() @IsString() @MaxLength(300) referencia?: string;
  @IsOptional() @IsEnum(['OPERATIVO', 'FUERA_SERVICIO', 'SIN_VERIFICAR'] as const)
  estado?: 'OPERATIVO' | 'FUERA_SERVICIO' | 'SIN_VERIFICAR';
  @IsOptional() @IsInt() @Min(0) @Max(100000) caudalLpm?: number;
  @IsOptional() @IsDateString() ultimaInspeccion?: string;
  @IsOptional() @texto() @IsString() @MaxLength(500) observaciones?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class CrearPuntoRiesgoDto {
  @texto$() @IsString() @MinLength(2) @MaxLength(150) nombre!: string;
  @texto$() @IsString() @MinLength(3) @MaxLength(300) direccion!: string;
  @IsLatitude() latitud!: number;
  @IsLongitude() longitud!: number;
  @IsOptional() @IsEnum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] as const)
  nivelRiesgo?: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  @IsOptional() @texto() @IsString() @MaxLength(60) categoria?: string;
  @IsOptional() @texto() @IsString() @MaxLength(150) contactoNombre?: string;
  @IsOptional() @texto() @IsString() @MaxLength(40) contactoTelefono?: string;
  @IsOptional() @texto() @IsString() @MaxLength(1000) descripcion?: string;
}

export class ActualizarPuntoRiesgoDto {
  @IsOptional() @texto$() @IsString() @MinLength(2) @MaxLength(150) nombre?: string;
  @IsOptional() @texto$() @IsString() @MinLength(3) @MaxLength(300) direccion?: string;
  @IsOptional() @IsLatitude() latitud?: number;
  @IsOptional() @IsLongitude() longitud?: number;
  @IsOptional() @IsEnum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] as const)
  nivelRiesgo?: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  @IsOptional() @texto() @IsString() @MaxLength(60) categoria?: string;
  @IsOptional() @texto() @IsString() @MaxLength(150) contactoNombre?: string;
  @IsOptional() @texto() @IsString() @MaxLength(40) contactoTelefono?: string;
  @IsOptional() @texto() @IsString() @MaxLength(1000) descripcion?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class GuardarPreplanDto {
  @texto$() @IsString() @MinLength(3) @MaxLength(200) titulo!: string;
  @texto$() @IsString() @MinLength(3) @MaxLength(20000) contenido!: string;
}
