import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class FinalizarDesignacionDto {
  @ApiProperty({ required: false, description: 'Si se omite, se usa la fecha de hoy' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
