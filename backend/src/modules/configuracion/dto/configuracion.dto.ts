import { IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ValoresConfiguracionDto { @IsObject() values: Record<string, unknown>; }
export class ActualizarBorradorDto extends ValoresConfiguracionDto {
  @IsOptional() @IsString() @MaxLength(500) motivo?: string;
}
export class RestaurarVersionDto { @IsString() @MaxLength(500) motivo: string; }
