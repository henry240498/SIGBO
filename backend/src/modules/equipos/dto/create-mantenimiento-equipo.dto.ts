import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

const TIPOS = ['PREVENTIVO', 'CORRECTIVO', 'CALIBRACION'] as const;

export class CreateMantenimientoEquipoDto {
  @ApiProperty() @IsString() @MinLength(1) fecha: string;

  @ApiProperty({ enum: TIPOS }) @IsIn(TIPOS) tipo: (typeof TIPOS)[number];

  @ApiProperty() @IsString() @MinLength(1) descripcion: string;

  @ApiProperty({ required: false }) @IsOptional() @IsNumber() costo?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() proveedor?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() tecnico?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() proximoMantenimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() archivoUrl?: string;
}
