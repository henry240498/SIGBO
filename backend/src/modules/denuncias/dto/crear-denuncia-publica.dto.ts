import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length, Matches, Max, Min } from 'class-validator';

const textoOpcional = ({ value }: { value: unknown }) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

export class CrearDenunciaPublicaDto {
  @IsString() @Length(2, 160) nombre: string;
  @IsString() @Length(6, 30) telefono: string;
  @IsUUID() categoriaId: string;
  @IsOptional() @Transform(textoOpcional) @IsString() @Length(2, 180) asuntoOtro?: string;
  @IsOptional() @Transform(textoOpcional) @IsString() @Length(3, 5000) descripcion?: string;
  @IsOptional() @IsUUID() servicioId?: string;
  @IsOptional() @IsUUID() vehiculoId?: string;
  @IsOptional() @Type(() => Number) @Min(-90) @Max(90) latitud?: number;
  @IsOptional() @Type(() => Number) @Min(-180) @Max(180) longitud?: number;
  @IsOptional() @Type(() => Number) @Min(0) @Max(100000) precisionUbicacion?: number;
  @IsOptional() @Type(() => Number) @Min(1) @Max(120) duracionAudioSegundos?: number;
  @IsOptional() @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, { message: 'La clave de envío no es válida' }) claveIdempotencia?: string;
}
