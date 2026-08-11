import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConsumoCombustibleDto {
  @ApiProperty() @IsString() @MinLength(1) fecha: string;

  @ApiProperty() @IsNumber() galones: number;

  @ApiProperty() @IsInt() kilometrajeActual: number;

  @ApiProperty({ required: false, default: 'DIESEL' }) @IsOptional() @IsString() tipoCombustible?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsNumber() costo?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() proveedor?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() factura?: string;
}
