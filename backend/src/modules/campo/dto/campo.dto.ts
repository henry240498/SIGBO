import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

/** Campos que acompanan al archivo (multipart: todo llega como texto). */
export class SubirAdjuntoDto {
  @IsEnum(['SERVICIO', 'DESPACHO', 'VEHICULO', 'HIDRANTE', 'PUNTO_RIESGO'] as const)
  entidad!: 'SERVICIO' | 'DESPACHO' | 'VEHICULO' | 'HIDRANTE' | 'PUNTO_RIESGO';

  @IsUUID()
  entidadId!: string;

  @IsEnum(['FOTO', 'FIRMA'] as const)
  tipo!: 'FOTO' | 'FIRMA';

  @IsOptional() @opcional() @IsString() @MaxLength(200) descripcion?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) claveIdempotencia?: string;
  /** Hora en que se tomo la foto (si se subio despues, sin conexion). */
  @IsOptional() @IsDateString() tomadoEn?: string;
}

export class RegistrarVictimasDto {
  @IsUUID() servicioId!: string;
  @IsEnum(['RESCATADA', 'HERIDA', 'FALLECIDA', 'EVACUADA'] as const) categoria!: 'RESCATADA' | 'HERIDA' | 'FALLECIDA' | 'EVACUADA';
  @IsInt() @Min(1) @Max(500) cantidad!: number;
  @IsOptional() @opcional() @IsString() @MaxLength(500) observacion?: string;
}

export class SolicitarAusenciaDto {
  @IsDateString() desde!: string;
  @IsDateString() hasta!: string;
  @recortar() @IsString() @MinLength(3) @MaxLength(300) motivo!: string;
  /** Solo quien decide ausencias puede pedirlas para otro bombero. */
  @IsOptional() @IsUUID() bomberoId?: string;
}

export class DecidirAusenciaDto {
  @IsEnum(['APROBAR', 'RECHAZAR'] as const) decision!: 'APROBAR' | 'RECHAZAR';
  @IsOptional() @opcional() @IsString() @MaxLength(300) motivo?: string;
}

export class CancelarAusenciaDto {
  @IsOptional() @opcional() @IsString() @MaxLength(300) motivo?: string;
}
