import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min,
  MinLength, ValidateNested,
} from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class SolicitarImportacionDto {
  /** Hash de una fuente que aparece en el descubrimiento; nunca una ruta. */
  @Matches(/^[a-f0-9]{64}$/) documentoSeleccionId!: string;
  @IsUUID() claveIdempotencia!: string;
}

export class PaginaRevisionDto {
  @IsIn(['TABLA_1', 'TABLA_2', 'TABLA_3']) tablaCodigo!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(3000) paginaPdf!: number;
}

export class RegistrarRevisionDto {
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @IsUUID('all', { each: true }) filaIds?: string[];
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(3000) @IsUUID('all', { each: true }) referenciaIds?: string[];
  @IsOptional() @ValidateNested() @Type(() => PaginaRevisionDto) pagina?: PaginaRevisionDto;
  @IsIn(['VERIFICADO', 'RECHAZADO', 'CORRECCION_PROPUESTA']) resultado!: 'VERIFICADO' | 'RECHAZADO' | 'CORRECCION_PROPUESTA';
  /** Qué se cotejó y contra qué: queda en cada revisión y en la auditoría. */
  @recortar() @IsString() @MinLength(10) @MaxLength(2000) fundamento!: string;
  @IsOptional() @recortar() @IsString() @MaxLength(2000) valorPropuesto?: string;
  @IsUUID() claveIdempotencia!: string;
}

export class ValidarVersionDto {
  @recortar() @IsString() @MinLength(10) @MaxLength(2000) fundamento!: string;
  @IsUUID() claveIdempotencia!: string;
}

export class ActivarVersionDto {
  @IsUUID() versionGreId!: string;
  @Type(() => Number) @IsInt() @Min(0) revisionActivacionEsperada!: number;
  @recortar() @IsString() @MinLength(10) @MaxLength(2000) motivo!: string;
  @IsUUID() claveIdempotencia!: string;
}

export class CompararVersionesDto {
  @IsUUID() versionAnteriorId!: string;
  @IsUUID() versionCandidataId!: string;
}

export class ReferenciasGreDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(3000) paginaPdf?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500000) pagina?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(3000) tamano?: number;
}
