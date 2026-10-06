import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export class RegistrarInspeccionDto {
  @recortar() @IsString() @MinLength(2) @MaxLength(150) establecimiento!: string;
  @recortar() @IsString() @MinLength(3) @MaxLength(300) direccion!: string;
  @IsDateString() fecha!: string;
  @IsEnum(['APROBADO', 'CON_OBSERVACIONES', 'RECHAZADO'] as const)
  resultado!: 'APROBADO' | 'CON_OBSERVACIONES' | 'RECHAZADO';
  @IsOptional() @IsUUID() puntoRiesgoId?: string;
  @IsOptional() @opcional() @IsString() @MaxLength(1000) observaciones?: string;
  /** Solo si el resultado es APROBADO: numero y vencimiento del certificado. */
  @IsOptional() @opcional() @IsString() @MaxLength(40) certificadoNumero?: string;
  @IsOptional() @IsDateString() certificadoVence?: string;
}
