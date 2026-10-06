import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const recortar = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const opcional = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() || undefined : value));

export const TIPOS_REPORTE = ['ERROR', 'SUGERENCIA', 'OTRO'] as const;
export const ORIGENES_REPORTE = ['APP_MOVIL', 'WEB'] as const;
export type TipoReporte = (typeof TIPOS_REPORTE)[number];
export type OrigenReporte = (typeof ORIGENES_REPORTE)[number];

export const MAX_MENSAJE = 4000;

export class CrearReporteDto {
  @IsEnum(TIPOS_REPORTE) tipo!: TipoReporte;
  @IsEnum(ORIGENES_REPORTE) origen!: OrigenReporte;

  @recortar() @IsString() @MinLength(5) @MaxLength(MAX_MENSAJE) mensaje!: string;

  @IsOptional() @opcional() @IsString() @MaxLength(120) titulo?: string;
  /** Pantalla o seccion donde estaba la persona. */
  @IsOptional() @opcional() @IsString() @MaxLength(120) pantalla?: string;
  /** Version de la app o del sistema. */
  @IsOptional() @opcional() @IsString() @MaxLength(40) version?: string;
  /** Modelo del celular o navegador. */
  @IsOptional() @opcional() @IsString() @MaxLength(160) dispositivo?: string;

  /** Id generado por el cliente: un reenvio desde la cola sin conexion no duplica el reporte. */
  @IsOptional() @IsUUID() id?: string;
  /** Hora en que se escribio el reporte (si se envio despues, sin conexion). */
  @IsOptional() @IsDateString() ocurridoEn?: string;
}
