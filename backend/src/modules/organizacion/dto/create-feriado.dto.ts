import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const TIPOS = ['FIJO', 'MOVIL', 'TRASLADADO'];

export class CreateFeriadoDto {
  @ApiProperty() @IsString() @IsNotEmpty() fecha: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;

  @ApiProperty({ required: false, enum: TIPOS, default: 'FIJO' }) @IsOptional() @IsIn(TIPOS) tipo?: string;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() esEspecial?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class UpdateFeriadoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false, enum: TIPOS }) @IsOptional() @IsIn(TIPOS) tipo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() esEspecial?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() activo?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class MoverFeriadoDto {
  @ApiProperty() @IsString() @IsNotEmpty() nuevaFecha: string;
  @ApiProperty() @IsString() @IsNotEmpty() motivo: string;
}
