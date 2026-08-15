import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];

export class EntradaItemDto {
  @ApiProperty({ enum: TIPOS_ELEMENTO }) @IsIn(TIPOS_ELEMENTO) tipoElemento: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) articuloId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) equipoId?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) cantidad: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) precioUnitario?: number;
}

/** `tipoEntradaId` referencia organizacion.parametros (tipo
 * TIPO_MOVIMIENTO_DEPOSITO) -- se espera Compra/Donacion/Transferencia/
 * Devolucion/Recuperacion/Otro (seccion 10 del pedido). */
export class CreateEntradaDepositoDto {
  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoEntradaId: string;

  @ApiProperty() @IsISO8601() fecha: string;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) proveedorId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() donanteNombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() donanteDocumento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() numeroDocumento?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) valorTotal?: number;

  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  ubicacionDestinoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;

  @ApiProperty({ type: [EntradaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntradaItemDto)
  items: EntradaItemDto[];
}
