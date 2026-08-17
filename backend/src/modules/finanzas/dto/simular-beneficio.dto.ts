import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const AMBITOS = ['ACADEMIA', 'SERVICIOS', 'GENERAL'];

export class SimularBeneficioDto {
  @ApiProperty({ description: 'finanzas.socios_protectores.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  socioProtectorId: string;

  @ApiProperty({ enum: AMBITOS }) @IsIn(AMBITOS) ambito: string;

  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) montoBase: number;

  @ApiProperty({ required: false, description: 'academia.actividades.id -- para preferir un beneficio especifico sobre uno general' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  referenciaId?: string;
}
