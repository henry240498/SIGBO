import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['ACTIVA', 'INACTIVA'];

export class CreateCajaDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class UpdateCajaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false, enum: ESTADOS }) @IsOptional() @IsIn(ESTADOS) estado?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class AbrirCajaDto {
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) saldoInicial: number;
}

export class CerrarCajaDto {
  @ApiProperty({ description: 'Conteo fisico real de la caja al cierre' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  saldoFisico: number;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
