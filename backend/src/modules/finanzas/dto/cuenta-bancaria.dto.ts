import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['ACTIVA', 'INACTIVA'];

export class CreateCuentaBancariaDto {
  @ApiProperty() @IsString() banco: string;
  @ApiProperty() @IsString() numeroCuenta: string;
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_CUENTA_BANCARIA_FINANZAS)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoCuentaId?: string;
  @ApiProperty({ required: false, default: 'PYG' }) @IsOptional() @IsString() moneda?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class UpdateCuentaBancariaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() banco?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() numeroCuenta?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoCuentaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() moneda?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false, enum: ESTADOS }) @IsOptional() @IsIn(ESTADOS) estado?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
