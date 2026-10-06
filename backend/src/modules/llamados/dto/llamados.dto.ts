import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/** Quita espacios de los extremos; el texto vacio cuenta como ausente. */
const limpiar = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export class CrearLlamadoDto {
  /** Clave generada por la app: reintentar el mismo envio no crea un llamado repetido. */
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) claveIdempotencia?: string;
  /** Hora real si se registro sin conexion. */
  @IsOptional() @IsDateString() ocurridoEn?: string;

  /** Radio, telefono, presencial, etc. Lista abierta: la define el cuartel. */
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  medio!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  direccion!: string;

  @IsOptional() @limpiar() @IsString() @MaxLength(150) llamanteNombre?: string;
  @IsOptional() @limpiar() @IsString() @MaxLength(40) llamanteTelefono?: string;
  @IsOptional() @limpiar() @IsString() @MaxLength(300) referencia?: string;
  @IsOptional() @limpiar() @IsString() @MaxLength(1000) descripcion?: string;
  @IsOptional() @IsUUID() tipoServicioId?: string;
}

export class CambiarEstadoLlamadoDto {
  @IsEnum(['EN_ATENCION', 'CERRADO'] as const)
  estado!: 'EN_ATENCION' | 'CERRADO';

  /** Obligatorio al cerrar un llamado que nunca llego a atenderse. */
  @IsOptional() @limpiar() @IsString() @MaxLength(500) motivo?: string;
}

export class VincularServicioDto {
  @IsUUID()
  servicioId!: string;
}

export class CrearConvocatoriaDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  mensaje!: string;

  @IsOptional() @IsUUID() llamadoId?: string;
  @IsOptional() @IsUUID() servicioId?: string;
}

export class ResponderConvocatoriaDto {
  @IsEnum(['VOY', 'NO_PUEDO'] as const)
  respuesta!: 'VOY' | 'NO_PUEDO';

  /** Minutos que tardaria en llegar; solo tiene sentido con VOY. */
  @IsOptional() @IsInt() @Min(0) @Max(600) etaMinutos?: number;

  @IsOptional() @limpiar() @IsString() @MaxLength(500) motivo?: string;
}

export class MotivoConvocatoriaDto {
  @IsOptional() @limpiar() @IsString() @MaxLength(500) motivo?: string;
}
