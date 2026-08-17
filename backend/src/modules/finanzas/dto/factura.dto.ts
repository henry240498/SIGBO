import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsIn, IsNumber, IsOptional, IsString, Matches, Min, MaxLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ORIGENES = ['MANUAL', 'SIGBO'];

export class CreateFacturaDto {
  @ApiProperty({ required: false, enum: ORIGENES, default: 'MANUAL', description: 'MANUAL: factura fisica ya emitida, solo se registra' })
  @IsOptional() @IsIn(ORIGENES)
  origen?: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_DOCUMENTO_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoComprobanteId: string;

  @ApiProperty() @IsString() @MaxLength(50) numero: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(3) establecimiento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(3) puntoExpedicion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(10) serie?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) timbrado?: string;
  @ApiProperty() @IsISO8601() fecha: string;

  @ApiProperty({ required: false, description: 'finanzas.socios_protectores.id -- si el cliente es un Socio Protector' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  socioProtectorId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) clienteNombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(30) clienteRucCi?: string;

  @ApiProperty() @IsString() @MaxLength(300) concepto: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() detalle?: string;

  @ApiProperty({ required: false, default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01) cantidad?: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) precioUnitario: number;
  @ApiProperty({ required: false, default: 0 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) descuento?: number;
  @ApiProperty({ required: false, default: 0 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) impuestos?: number;
  @ApiProperty({ required: false, default: 'PYG' }) @IsOptional() @IsString() moneda?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo MEDIO_PAGO_FINANZAS)' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  formaPagoId?: string;

  @ApiProperty({ required: false, description: 'finanzas.aportes.id -- si esta factura respalda un aporte ya registrado (no genera un ingreso nuevo, ya existe)' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  aporteId?: string;

  @ApiProperty({ required: false, description: 'academia.inscripciones.id' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  inscripcionAcademiaId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() archivoUrl?: string;

  @ApiProperty({ required: false, default: false, description: 'Si es true (y no hay aporteId), registra ademas un ingreso en Finanzas por el total de esta factura' })
  @IsOptional() @IsBoolean()
  generarIngreso?: boolean;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_INGRESO_FINANZAS) -- requerido si generarIngreso=true' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoIngresoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cajaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cuentaBancariaId?: string;
}

export class AnularFacturaDto {
  @ApiProperty() @IsString() motivo: string;
}

export class CreateNotaCreditoDto {
  @ApiProperty({ description: 'finanzas.facturas.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  facturaId: string;

  @ApiProperty() @IsString() @MaxLength(50) numero: string;
  @ApiProperty() @IsISO8601() fecha: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo MOTIVO_NOTA_CREDITO_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  motivoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(300) concepto?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) importe: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() archivoUrl?: string;
}
