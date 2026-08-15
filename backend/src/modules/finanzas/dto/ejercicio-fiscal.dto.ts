import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsInt, Max, Min } from 'class-validator';

export class CreateEjercicioFiscalDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(2000) @Max(2100) anio: number;
  @ApiProperty() @IsISO8601() fechaInicio: string;
  @ApiProperty() @IsISO8601() fechaFin: string;
}
