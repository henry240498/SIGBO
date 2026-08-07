import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePermisoDto {
  @ApiProperty({ description: 'Convencion recurso:accion, ej. productos:crear' })
  @IsString()
  @MinLength(3)
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty() @IsString() recurso: string;
  @ApiProperty() @IsString() accion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoria?: string;
}
