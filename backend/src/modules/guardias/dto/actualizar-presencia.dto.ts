import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarPresenciaDto {
  @ApiProperty({ description: 'Nombre del parametro organizacion.parametros tipo ESTADO_PRESENCIA_GUARDIA' })
  @IsString()
  @MinLength(1)
  estadoPresencia: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
}
