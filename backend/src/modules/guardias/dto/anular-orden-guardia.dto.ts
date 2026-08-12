import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AnularOrdenGuardiaDto {
  @ApiProperty() @IsString() @IsNotEmpty() motivo: string;
}

export class RegistrarModificacionOrdenDto {
  @ApiProperty({ description: 'ej. feriado, asignacion, grupo, general' }) @IsString() @IsNotEmpty() campo: string;
  @ApiProperty() @IsString() @IsNotEmpty() descripcion: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() valorAnterior?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() valorNuevo?: string;
  @ApiProperty() @IsString() @IsNotEmpty() motivo: string;
}
