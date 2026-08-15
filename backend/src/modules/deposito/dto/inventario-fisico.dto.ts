import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];

export class CreateInventarioFisicoDto {
  @ApiProperty() @IsISO8601() fecha: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) ubicacionId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class AgregarItemInventarioFisicoDto {
  @ApiProperty({ enum: TIPOS_ELEMENTO }) @IsIn(TIPOS_ELEMENTO) tipoElemento: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) articuloId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) equipoId?: string;
  @ApiProperty({ description: 'Cantidad contada fisicamente' }) @Type(() => Number) @IsNumber() cantidadFisica: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
