import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRangoDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(20) codigo: string;

  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) nombre: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  nivelJerarquico?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false, description: 'URL de la imagen de la insignia' })
  @IsOptional()
  @IsString()
  insigniaUrl?: string;

  @ApiProperty({ required: false, default: '#6B7280' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color debe ser un hex de 6 digitos, ej. #6B7280' })
  color?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  ordenJerarquico?: number;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
