import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateOrdenPagoDto {
  @ApiProperty() @IsString() concepto: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) importe: number;
  @ApiProperty({ description: 'organizacion.parametros.id (tipo CATEGORIA_EGRESO_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaEgresoId: string;
  @ApiProperty({ required: false, description: 'deposito.proveedores.id' }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) proveedorId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class ConVersionDto {
  @ApiProperty({ description: 'Version actual de la orden -- optimistic locking' })
  @Type(() => Number)
  @IsInt()
  version: number;
}

export class RechazarOrdenPagoDto extends ConVersionDto {
  @ApiProperty() @IsString() motivo: string;
}

export class AnularOrdenPagoDto extends ConVersionDto {
  @ApiProperty() @IsString() motivo: string;
}

export class PagarOrdenPagoDto extends ConVersionDto {
  @ApiProperty() @IsISO8601() fecha: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cajaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cuentaBancariaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
}
