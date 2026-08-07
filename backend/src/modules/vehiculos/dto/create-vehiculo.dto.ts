import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateVehiculoDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(20) numeroInterno: string;

  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50) tipo: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(50) marca?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(50) modelo?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() anio?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) patente?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(30) color?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(50) numeroChasis?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(50) numeroMotor?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() capacidadCarga?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() capacidadPasajeros?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  kilometrajeActual?: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  combustibleActual?: number;

  @ApiProperty({
    required: false,
    enum: ['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO', 'BAJA'],
    default: 'OPERATIVO',
  })
  @IsOptional()
  @IsIn(['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO', 'BAJA'])
  estado?: 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_SERVICIO' | 'BAJA';

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) ubicacionActual?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() itvFecha?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() itvVencimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() seguroFecha?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() seguroVencimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) seguroEmpresa?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(50) seguroPoliza?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() ultimoMantenimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() proximoMantenimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() ultimoCambioAceite?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() ultimoCambioCubiertas?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() ultimaRevisionBateria?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) qrCode?: string;
}
