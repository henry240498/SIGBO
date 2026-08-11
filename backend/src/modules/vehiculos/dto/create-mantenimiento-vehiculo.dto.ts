import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

const TIPOS = ['PREVENTIVO', 'CORRECTIVO', 'EMERGENCIA', 'ITV', 'REPARACION'] as const;

export class CreateMantenimientoVehiculoDto {
  @ApiProperty({ enum: TIPOS }) @IsIn(TIPOS) tipo: (typeof TIPOS)[number];

  @ApiProperty() @IsString() @MinLength(1) fecha: string;

  @ApiProperty() @IsString() @MinLength(1) descripcion: string;

  @ApiProperty({ required: false }) @IsOptional() @IsNumber() costo?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() kilometraje?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() taller?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() responsable?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() proximoMantenimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() archivoUrl?: string;
}
