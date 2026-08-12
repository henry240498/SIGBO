import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOrdenGuardiaDto {
  @ApiProperty() @IsInt() @Min(2000) @Max(2100) anio: number;
  @ApiProperty({ description: '1-12' }) @IsInt() @Min(1) @Max(12) mes: number;
  @ApiProperty({ description: 'YYYY-MM-DD' }) @IsString() @IsNotEmpty() fechaEmision: string;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD; por defecto el primer dia del mes indicado' })
  @IsOptional()
  @IsString()
  periodoDesde?: string;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD; por defecto el ultimo dia del mes indicado' })
  @IsOptional()
  @IsString()
  periodoHasta?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}
