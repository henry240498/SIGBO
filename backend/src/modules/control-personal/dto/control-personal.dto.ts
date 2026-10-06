import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export class CrearAptitudDto {
  @IsUUID() bomberoId!: string;
  @IsEnum(['MEDICA', 'LICENCIA', 'OTRA'] as const) categoria!: 'MEDICA' | 'LICENCIA' | 'OTRA';
  @recortar() @IsString() @MinLength(2) @MaxLength(80) tipo!: string;
  @IsDateString() venceEn!: string;
  @IsOptional() @IsDateString() emitidoEn?: string;
  @IsOptional() @opcional() @IsString() @MaxLength(500) observacion?: string;
}

export class ActualizarAptitudDto {
  @IsOptional() @recortar() @IsString() @MinLength(2) @MaxLength(80) tipo?: string;
  @IsOptional() @IsDateString() venceEn?: string;
  @IsOptional() @IsDateString() emitidoEn?: string;
  @IsOptional() @opcional() @IsString() @MaxLength(500) observacion?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class FijarLimitesHorasDto {
  @IsInt() @Min(1) @Max(744) horasMaximasPeriodo!: number;
  @IsInt() @Min(1) @Max(366) periodoDias!: number;
  @IsInt() @Min(0) @Max(168) descansoMinimoHoras!: number;
}

export class CrearPuntoFichajeDto {
  @recortar() @IsString() @MinLength(2) @MaxLength(100) nombre!: string;
}

export class ActualizarPuntoFichajeDto {
  @IsOptional() @recortar() @IsString() @MinLength(2) @MaxLength(100) nombre?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class EscanearDto {
  @IsOptional() @IsDateString() ocurridoEn?: string;

  @recortar() @IsString() @MinLength(16) @MaxLength(128) token!: string;
}
