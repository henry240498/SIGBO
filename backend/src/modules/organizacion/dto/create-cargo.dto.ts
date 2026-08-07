import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateCargoDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(20) codigo: string;

  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  nivel?: number;

  @ApiProperty({ required: false, description: 'Id del cargo del que depende (auto-referencia)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  dependenciaCargoId?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: 'ACTIVO' | 'INACTIVO';
}
