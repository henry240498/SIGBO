import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS_UBICACION = ['ACTIVA', 'INACTIVA'];

export class CreateUbicacionDepositoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_UBICACION_DEPOSITO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoUbicacionId: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  padreId?: string;
  @ApiProperty({ required: false, description: 'organizacion.cuarteles.id -- ancla la raiz de la jerarquia' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cuartelId?: string;
  @ApiProperty({ required: false, enum: ESTADOS_UBICACION }) @IsOptional() @IsIn(ESTADOS_UBICACION) estado?: string;
}

export class UpdateUbicacionDepositoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoUbicacionId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  padreId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cuartelId?: string;
  @ApiProperty({ required: false, enum: ESTADOS_UBICACION }) @IsOptional() @IsIn(ESTADOS_UBICACION) estado?: string;
}
