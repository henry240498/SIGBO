import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

const CATEGORIAS = ['MECANICA', 'EQUIPAMIENTO', 'OTRO'] as const;

export class CreateChecklistItemVehiculoDto {
  @ApiProperty({ required: false, description: 'NULL = aplica a todos los tipos de vehiculo' })
  @IsOptional()
  @IsString()
  tipoVehiculo?: string;

  @ApiProperty() @IsString() @MinLength(1) nombre: string;

  @ApiProperty({ enum: CATEGORIAS, default: 'MECANICA' })
  @IsOptional()
  @IsIn(CATEGORIAS)
  categoria?: (typeof CATEGORIAS)[number];

  @ApiProperty({ required: false, default: 0 }) @IsOptional() @IsInt() orden?: number;
}

export class UpdateChecklistItemVehiculoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() tipoVehiculo?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(1) nombre?: string;

  @ApiProperty({ required: false, enum: CATEGORIAS })
  @IsOptional()
  @IsIn(CATEGORIAS)
  categoria?: (typeof CATEGORIAS)[number];

  @ApiProperty({ required: false }) @IsOptional() @IsInt() orden?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() activo?: boolean;
}
