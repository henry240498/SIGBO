import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];
const GRAVEDADES = ['BAJA', 'MEDIA', 'ALTA'];

export class CreateIncidenciaDepositoDto {
  @ApiProperty({ required: false, enum: TIPOS_ELEMENTO }) @IsOptional() @IsIn(TIPOS_ELEMENTO) tipoElemento?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) articuloId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) equipoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) vehiculoId?: string;
  @ApiProperty() @IsString() descripcion: string;
  @ApiProperty({ required: false, enum: GRAVEDADES, default: 'MEDIA' }) @IsOptional() @IsIn(GRAVEDADES) gravedad?: string;
}

export class ResolverIncidenciaDto {
  @ApiProperty() @IsString() resolucion: string;
  @ApiProperty({ required: false, enum: ['RESUELTA', 'DESCARTADA'], default: 'RESUELTA' })
  @IsOptional()
  @IsIn(['RESUELTA', 'DESCARTADA'])
  estado?: string;
}
