import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];

export class PrestamoItemDto {
  @ApiProperty({ enum: TIPOS_ELEMENTO }) @IsIn(TIPOS_ELEMENTO) tipoElemento: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) articuloId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) equipoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01) cantidad?: number;

  @ApiProperty({ required: false, description: 'De donde sale actualmente (ubicacion de deposito habitual)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  origenUbicacionId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenVehiculoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenBomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenServicioId?: string;
}

export class CreatePrestamoDepositoDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_PRESTAMO_DEPOSITO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoPrestamoId: string;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) solicitanteBomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() solicitanteExterno?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) servicioDestinoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) autorizadoPor?: string;

  @ApiProperty() @IsISO8601() fechaEntrega: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaDevolucionComprometida?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;

  @ApiProperty({ type: [PrestamoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrestamoItemDto)
  items: PrestamoItemDto[];
}

const ESTADOS_ITEM_DEVOLUCION = ['DEVUELTO', 'EXTRAVIADO', 'DANIADO'];

export class DevolverItemDto {
  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  itemId: string;

  @ApiProperty({ enum: ESTADOS_ITEM_DEVOLUCION })
  @IsIn(ESTADOS_ITEM_DEVOLUCION)
  estadoItem: string;

  @ApiProperty({ required: false, description: 'Requerido si estadoItem=DEVUELTO -- a que ubicacion de deposito vuelve' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  ubicacionDestinoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class DevolverPrestamoDto {
  @ApiProperty({ type: [DevolverItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevolverItemDto)
  items: DevolverItemDto[];

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}
