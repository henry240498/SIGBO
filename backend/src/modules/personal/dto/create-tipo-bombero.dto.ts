import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTipoBomberoDto {
  @ApiProperty() @IsString() @MinLength(2) nombre: string;

  @ApiProperty({ description: 'Prefijo usado en el codigo bomberil, ej. BC, BCF' })
  @IsString()
  @MinLength(1)
  prefijo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';
}
