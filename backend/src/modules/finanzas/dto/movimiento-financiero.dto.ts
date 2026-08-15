import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS = ['INGRESO', 'EGRESO'];

export class DocumentoRespaldoInputDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_DOCUMENTO_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoDocumentoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() numero?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() timbrado?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fecha?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) proveedorId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) importe?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() archivoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class RegistrarMovimientoFinancieroDto {
  @ApiProperty({ enum: TIPOS }) @IsIn(TIPOS) tipo: string;
  @ApiProperty() @IsISO8601() fecha: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_INGRESO_FINANZAS) -- requerido si tipo=INGRESO' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoIngresoId?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo CATEGORIA_EGRESO_FINANZAS) -- requerido si tipo=EGRESO' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaEgresoId?: string;

  @ApiProperty() @IsString() concepto: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) importe: number;

  @ApiProperty({ required: false, description: 'Exactamente uno de cajaId/cuentaBancariaId' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cajaId?: string;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cuentaBancariaId?: string;
  @ApiProperty({ required: false, description: 'deposito.proveedores.id' }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) proveedorId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) bomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() entidadExterna?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false, description: 'finanzas.cuotas.id -- si este ingreso paga una cuota' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cuotaId?: string;

  @ApiProperty({ required: false, description: 'deposito.entradas.id -- integracion compras/donaciones' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  depositoEntradaId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;

  @ApiProperty({ required: false, type: DocumentoRespaldoInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentoRespaldoInputDto)
  documento?: DocumentoRespaldoInputDto;
}

export class AnularMovimientoFinancieroDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo MOTIVO_ANULACION_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  motivoAnulacionId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivoAnulacionDetalle?: string;
}
