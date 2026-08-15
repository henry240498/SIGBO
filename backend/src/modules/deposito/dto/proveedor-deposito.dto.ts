import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

const ESTADOS_PROVEEDOR = ['ACTIVO', 'INACTIVO'];

export class CreateProveedorDepositoDto {
  @ApiProperty() @IsString() razonSocial: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombreComercial?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() ruc?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() direccion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefono?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contacto?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}

export class UpdateProveedorDepositoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() razonSocial?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombreComercial?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() ruc?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() direccion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefono?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contacto?: string;
  @ApiProperty({ required: false, enum: ESTADOS_PROVEEDOR }) @IsOptional() @IsIn(ESTADOS_PROVEEDOR) estado?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}
