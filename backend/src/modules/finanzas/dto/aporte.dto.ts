import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class RegistrarAporteDto {
  @ApiProperty({ description: 'finanzas.socios_protectores.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  socioProtectorId: string;

  @ApiProperty({ required: false, description: 'finanzas.acuerdos_aporte.id -- vacio para aportes sin acuerdo periodico' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  acuerdoAporteId?: string;

  @ApiProperty({ required: false, default: false, description: 'Aporte extraordinario -- no ajusta ni reemplaza el aporte periodico' })
  @IsOptional() @IsBoolean()
  esExtraordinario?: boolean;

  @ApiProperty() @IsISO8601() fecha: string;
  @ApiProperty({ required: false, description: "Formato 'HH:mm'" }) @IsOptional() @IsString() hora?: string;

  @ApiProperty({ description: 'Monto EFECTIVAMENTE pagado -- nunca se infiere del acuerdo' })
  @Type(() => Number) @IsNumber() @Min(0.01)
  monto: number;

  @ApiProperty({ required: false, default: 'PYG' }) @IsOptional() @IsString() moneda?: string;

  @ApiProperty({ required: false, description: "Formato 'YYYY-MM' -- periodo que este aporte cubre" })
  @IsOptional() @IsString()
  periodoCorrespondiente?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() concepto?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo MEDIO_PAGO_FINANZAS)' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  medioPagoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() numeroComprobante?: string;

  @ApiProperty({ required: false, description: 'Exactamente uno de cajaId/cuentaBancariaId' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cajaId?: string;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cuentaBancariaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() archivoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}

export class AnularAporteDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo MOTIVO_ANULACION_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  motivoAnulacionId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivoAnulacionDetalle?: string;
}
