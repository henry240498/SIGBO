import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CrearCategoriaDenunciaDto {
  @IsString() @Length(2, 120) nombre: string;
  @IsOptional() @IsInt() @Min(0) orden?: number;
}
export class ActualizarCategoriaDenunciaDto {
  @IsOptional() @IsString() @Length(2, 120) nombre?: string;
  @IsOptional() @IsInt() @Min(0) orden?: number;
  @IsOptional() @IsBoolean() activo?: boolean;
}
