import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CrearDotacionDto {
  @recortar() @IsString() @MinLength(2) @MaxLength(200) descripcion!: string;
  @IsInt() @Min(1) @Max(10000) cantidadObjetivo!: number;
  @IsOptional() @IsUUID() articuloId?: string;
}

export class ActualizarDotacionDto {
  @IsOptional() @recortar() @IsString() @MinLength(2) @MaxLength(200) descripcion?: string;
  @IsOptional() @IsInt() @Min(1) @Max(10000) cantidadObjetivo?: number;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class LecturaDotacionDto {
  @IsUUID() itemId!: string;
  @IsInt() @Min(0) @Max(10000) cantidadActual!: number;
}

export class ControlDotacionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LecturaDotacionDto)
  lecturas!: LecturaDotacionDto[];
}
