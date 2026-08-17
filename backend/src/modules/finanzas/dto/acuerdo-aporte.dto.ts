import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['ACTIVO', 'FINALIZADO', 'SUSPENDIDO', 'CANCELADO'];

export class CreateAcuerdoAporteDto {
  @ApiProperty({ description: 'finanzas.socios_protectores.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  socioProtectorId: string;

  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) montoAcordado: number;
  @ApiProperty({ required: false, default: 'PYG' }) @IsOptional() @IsString() moneda?: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo PERIODICIDAD_APORTE)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  periodicidadId: string;

  @ApiProperty() @IsISO8601() fechaInicio: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaFin?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo MEDIO_PAGO_FINANZAS)' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  medioPagoPreferidoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}

export class UpdateAcuerdoAporteDto extends PartialType(CreateAcuerdoAporteDto) {
  @ApiProperty({ required: false, enum: ESTADOS })
  @IsOptional() @IsIn(ESTADOS)
  estado?: string;
}
