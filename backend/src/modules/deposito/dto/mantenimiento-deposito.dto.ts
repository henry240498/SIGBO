import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];
const RESULTADOS_MANTENIMIENTO = ['Disponible', 'Danado', 'Fuera de servicio', 'Perdido'];

export class CreateMantenimientoDepositoDto {
  @ApiProperty({ enum: TIPOS_ELEMENTO }) @IsIn(TIPOS_ELEMENTO) tipoElemento: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) articuloId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) equipoId?: string;
  @ApiProperty({ required: false, description: 'Requerida si tipoElemento=ARTICULO' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  cantidad?: number;

  @ApiProperty({ description: 'Motivo del ingreso a mantenimiento' }) @IsString() motivo: string;

  @ApiProperty({ required: false, description: 'Responsable interno (personal.bomberos)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;

  @ApiProperty({ required: false, description: 'Taller externo cuando no lo hace personal propio' })
  @IsOptional()
  @IsString()
  tallerExterno?: string;

  @ApiProperty() @IsISO8601() fechaIngreso: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaEstimadaSalida?: string;

  @ApiProperty({ required: false, description: 'Origen del articulo -- requerido si tipoElemento=ARTICULO y hay mas de una tenencia' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  origenUbicacionId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenVehiculoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenBomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenServicioId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class FinalizarMantenimientoDto {
  @ApiProperty({ required: false, description: 'Ubicacion donde vuelve el elemento -- si se omite, vuelve a su ubicacion de origen' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  ubicacionDestinoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) costo?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaSalidaReal?: string;

  @ApiProperty({ required: false, enum: RESULTADOS_MANTENIMIENTO, description: 'Estado resultante del elemento (default: Disponible)' })
  @IsOptional()
  @IsIn(RESULTADOS_MANTENIMIENTO)
  resultado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
