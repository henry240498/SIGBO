import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];

export class CreateBajaDepositoDto {
  @ApiProperty({ enum: TIPOS_ELEMENTO }) @IsIn(TIPOS_ELEMENTO) tipoElemento: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) articuloId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) equipoId?: string;
  @ApiProperty({ required: false, description: 'Requerida si tipoElemento=ARTICULO' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  cantidad?: number;

  @ApiProperty({ required: false, description: 'Origen del articulo dado de baja -- requerido si tipoElemento=ARTICULO y hay mas de una tenencia' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  origenUbicacionId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenVehiculoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenBomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenServicioId?: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo MOTIVO_BAJA_DEPOSITO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  motivoBajaId: string;

  @ApiProperty() @IsISO8601() fecha: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) autorizadoPor?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() documentoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
