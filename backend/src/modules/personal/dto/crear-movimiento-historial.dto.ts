import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearMovimientoHistorialDto {
  @ApiProperty({ enum: ['RECONOCIMIENTO', 'SANCION'] })
  @IsIn(['RECONOCIMIENTO', 'SANCION'])
  tipoMovimiento: string;

  @ApiProperty() @IsString() @IsNotEmpty() fecha: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentoUrl?: string;
}
