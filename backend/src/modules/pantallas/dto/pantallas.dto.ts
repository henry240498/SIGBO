import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export class GuardarReglaPantallaDto {
  @Matches(/^0x[0-9A-F]{4}$/, { message: 'El codigo de pantalla debe ser 0xA001' }) pantallaCodigo!: string;
  @IsEnum(['ROL', 'USUARIO', 'RANGO', 'CARGO'] as const) sujetoTipo!: 'ROL' | 'USUARIO' | 'RANGO' | 'CARGO';
  @IsString() @MinLength(1) @MaxLength(100) sujetoId!: string;
  @IsBoolean() ver!: boolean;
  @IsBoolean() crear!: boolean;
  @IsBoolean() editar!: boolean;
  @IsBoolean() eliminar!: boolean;
  @IsBoolean() confidencial!: boolean;
  @IsBoolean() denegar!: boolean;
}

export class VisitaDto {
  @Matches(/^0x[0-9A-F]{4}$/) pantalla!: string;
  @IsDateString() entrada!: string;
  @IsOptional() @IsDateString() salida?: string;
  @IsOptional() @IsUUID() servicioId?: string;
  @IsOptional() @opcional() @IsString() @MaxLength(120) accion?: string;
  /** Si el celular tenia conexion en ese momento. */
  @IsOptional() @IsBoolean() conectado?: boolean;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) clave?: string;
}

export class RegistrarNavegacionDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => VisitaDto) eventos!: VisitaDto[];
  @IsOptional() @opcional() @IsString() @MaxLength(160) dispositivo?: string;
}
