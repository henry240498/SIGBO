import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export const TIPOS_SOLICITUD = ['CHOFER', 'PERSONAL', 'RAPIDA'] as const;
export const ACCIONES = ['ACEPTAR', 'NO_PUEDO', 'CANCELAR', 'EN_CAMINO', 'LLEGUE'] as const;
/** Lo que la persona puede elegir a mano. EN_CAMINO y EN_SERVICIO los fija el sistema. */
export const ESTADOS_ELEGIBLES = ['NO_DISPONIBLE', 'AL_LLAMADO', 'EN_BASE'] as const;

export class CrearSolicitudDto {
  @IsEnum(TIPOS_SOLICITUD) tipo!: (typeof TIPOS_SOLICITUD)[number];

  /** CHOFER: uno o varios. RAPIDA y PERSONAL: no se piden. */
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsUUID('all', { each: true }) moviles?: string[];

  @IsOptional() @opcional() @IsString() @MaxLength(300) mensaje?: string;
  @IsOptional() @IsUUID() servicioId?: string;
  @IsOptional() @IsUUID() llamadoId?: string;
  @IsOptional() @IsInt() @Min(1) @Max(200) requeridos?: number;
  /** Generada por el cliente: un reintento sin conexion no duplica la solicitud. */
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) claveIdempotencia?: string;
  /** Hora real del pedido si se hizo sin conexion. */
  @IsOptional() @IsString() ocurridoEn?: string;
}

export class ResponderDto {
  @IsEnum(ACCIONES) accion!: (typeof ACCIONES)[number];
  @IsOptional() @opcional() @IsString() @MaxLength(200) motivo?: string;
  @IsOptional() @IsString() ocurridoEn?: string;
}

export class CambiarDisponibilidadDto {
  @IsEnum(ESTADOS_ELEGIBLES) estado!: (typeof ESTADOS_ELEGIBLES)[number];
  @IsOptional() @IsBoolean() usaHorario?: boolean;
}

export class FranjaDto {
  @IsInt() @Min(1) @Max(7) diaSemana!: number;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora debe ser HH:MM' }) horaDesde!: string;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'La hora debe ser HH:MM' }) horaHasta!: string;
}

export class GuardarHorariosDto {
  @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => FranjaDto) franjas!: FranjaDto[];
  @IsOptional() @IsBoolean() usaHorario?: boolean;
}

export class CrearExcepcionDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/) fechaDesde!: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) fechaHasta!: string;
  @IsBoolean() disponible!: boolean;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) horaDesde?: string;
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) horaHasta?: string;
  @IsOptional() @recortar() @IsString() @MaxLength(200) motivo?: string;
}

export class CerrarSolicitudDto {
  @IsEnum(['CERRADA', 'CANCELADA'] as const) estado!: 'CERRADA' | 'CANCELADA';
  @IsOptional() @opcional() @IsString() @MaxLength(300) motivo?: string;
}
