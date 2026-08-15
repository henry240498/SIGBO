import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS_ARTICULO = ['ACTIVO', 'INACTIVO'];

export class CreateArticuloDto {
  @ApiProperty({ description: 'Codigo institucional -- independiente del id, editable, sin duplicados' })
  @IsString()
  codigo: string;

  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;

  @ApiProperty({ description: 'deposito.categorias_articulo.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaArticuloId: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo UNIDAD_MEDIDA_DEPOSITO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  unidadMedidaId?: string;

  @ApiProperty({ required: false, default: 0 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) stockMinimo?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) stockMaximo?: number;
  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() controlaLote?: boolean;
  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() controlaVencimiento?: boolean;
  @ApiProperty({ required: false, enum: ESTADOS_ARTICULO }) @IsOptional() @IsIn(ESTADOS_ARTICULO) estado?: string;

  /** Cantidad inicial opcional: si se envia, crea automaticamente un
   * movimiento de tipo Entrada (alta inicial) en la ubicacion indicada. */
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) stockInicial?: number;
  @ApiProperty({ required: false, description: 'deposito.ubicaciones.id -- requerido si se envia stockInicial' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  ubicacionInicialId?: string;
}

export class UpdateArticuloDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaArticuloId?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  unidadMedidaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) stockMinimo?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) stockMaximo?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() controlaLote?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() controlaVencimiento?: boolean;
  @ApiProperty({ required: false, enum: ESTADOS_ARTICULO }) @IsOptional() @IsIn(ESTADOS_ARTICULO) estado?: string;
}
