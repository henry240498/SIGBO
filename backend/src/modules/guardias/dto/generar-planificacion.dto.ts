import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerarPlanificacionDto {
  @ApiProperty({ description: 'YYYY-MM-DD' }) @IsString() @IsNotEmpty() desde: string;
  @ApiProperty({ description: 'YYYY-MM-DD' }) @IsString() @IsNotEmpty() hasta: string;

  @ApiProperty({ required: false, default: false, description: 'Permite que el mismo grupo/persona se repita dentro de su propio ciclo' })
  @IsOptional()
  @IsBoolean()
  permitirRepetirIntegrantes?: boolean;

  @ApiProperty({ required: false, default: false, description: 'Anula y reemplaza las guardias ya planificadas en el rango en vez de omitirlas' })
  @IsOptional()
  @IsBoolean()
  regenerarExistentes?: boolean;
}
