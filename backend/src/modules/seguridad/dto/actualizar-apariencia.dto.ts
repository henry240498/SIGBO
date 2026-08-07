import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarAparienciaDto {
  @ApiProperty({ required: false, description: 'Texto debajo del logo en la pantalla de login' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  textoBajoLogo?: string;

  @ApiProperty({ required: false, description: 'Nombre del sistema en el encabezado del menu' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombreSistemaMenu?: string;

  @ApiProperty({ required: false, description: 'Subtitulo del sistema en el encabezado del menu' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtituloMenu?: string;
}
