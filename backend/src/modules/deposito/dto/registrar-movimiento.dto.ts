import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_ELEMENTO = ['EQUIPO', 'ARTICULO'];

/** Endpoint generico de movimiento manual -- cubre Entrada/Salida/
 * Transferencia/Asignacion/Consumo/Mantenimiento/Recuperacion/Otro.
 * Prestamo/Devolucion/Baja/Compra/Donacion tienen sus propios endpoints
 * de mas alto nivel (Etapas 3-5) que internamente arman este mismo
 * movimiento sin exponer toda esta superficie al usuario final. */
export class RegistrarMovimientoDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_MOVIMIENTO_DEPOSITO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoMovimientoId: string;

  @ApiProperty({ enum: TIPOS_ELEMENTO })
  @IsIn(TIPOS_ELEMENTO)
  tipoElemento: string;

  @ApiProperty({ required: false, description: 'equipos.equipos.id -- requerido si tipoElemento=EQUIPO' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  equipoId?: string;

  @ApiProperty({ required: false, description: 'deposito.articulos.id -- requerido si tipoElemento=ARTICULO' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  articuloId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  loteId?: string;

  @ApiProperty({ required: false, description: 'Requerido si tipoElemento=ARTICULO' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  cantidad?: number;

  // --- Origen (de donde sale) ---
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_TENENCIA_DEPOSITO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  origenTipoTenenciaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenUbicacionId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenVehiculoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenBomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) origenServicioId?: string;

  // --- Destino (a donde llega) ---
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_TENENCIA_DEPOSITO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  destinoTipoTenenciaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) destinoUbicacionId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) destinoVehiculoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) destinoBomberoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) destinoServicioId?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo ESTADO_ELEMENTO_DEPOSITO) resultante' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  estadoElementoId?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id -- quien entrega/recibe fisicamente' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() documentoUrl?: string;
}
