import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEspecialidadDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  codigo: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false, description: 'Requisitos en texto libre' })
  @IsOptional()
  @IsString()
  requisitos?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';
}
