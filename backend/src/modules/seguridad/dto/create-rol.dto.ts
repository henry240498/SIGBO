import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateRolDto {
  @ApiProperty() @IsString() @MinLength(2) nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false, default: '#6B7280' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color debe ser un hex de 6 digitos, ej. #6B7280' })
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icono?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  prioridad?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  esAdministrativo?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  esOperativo?: boolean;
}
