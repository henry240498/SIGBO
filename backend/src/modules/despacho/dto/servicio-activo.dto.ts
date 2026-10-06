import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export class EnviarMensajeDto {
  @IsString() @MinLength(1) @MaxLength(600) texto!: string;
  /** Generada por el cliente: un reenvio desde la cola sin conexion no duplica el mensaje. */
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) clave?: string;
  @IsOptional() @IsString() ocurridoEn?: string;
}

export class CrearRespuestaFormularioDto {
  @IsUUID() definicionId!: string;
  @IsObject() datos!: Record<string, unknown>;
  @IsOptional() @IsBoolean() completar?: boolean;
  @IsOptional() @IsString() ocurridoEn?: string;
}

export class ModificarRespuestaFormularioDto {
  @IsObject() datos!: Record<string, unknown>;
  /** La version que la persona vio: si otro cambio el formulario antes, se avisa en lugar de pisarlo. */
  @IsInt() @Min(0) version!: number;
  @IsOptional() @IsBoolean() completar?: boolean;
  @IsOptional() @IsString() ocurridoEn?: string;
}

export class AnularRespuestaFormularioDto {
  @IsOptional() @opcional() @IsString() @MaxLength(300) motivo?: string;
  @IsInt() @Min(0) version!: number;
}

export class CambiarEstadoParticipanteDto {
  @IsEnum(['EN_SITIO', 'RETIRADO'] as const) estado!: 'EN_SITIO' | 'RETIRADO';
}

export class DefinicionFormularioDto {
  @Matches(/^[A-Z][A-Z0-9_]{1,39}$/, { message: 'El código va en mayúsculas, números y guion bajo' }) codigo!: string;
  @IsString() @MinLength(2) @MaxLength(120) nombre!: string;
  @IsOptional() @opcional() @IsString() @MaxLength(300) descripcion?: string;
  @IsArray() campos!: unknown[];
  @IsOptional() @IsArray() tiposServicio?: string[];
  @IsOptional() @IsArray() roles?: string[];
  @IsOptional() @opcional() @IsString() @MaxLength(80) permisoRequerido?: string;
  @IsOptional() @IsEnum(['EN_CURSO', 'CIERRE'] as const) etapa?: 'EN_CURSO' | 'CIERRE';
  @IsOptional() @IsBoolean() confidencial?: boolean;
  @IsOptional() @IsBoolean() activo?: boolean;
}
