import { IsEnum, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';
import type { TipoAlertaEmergencia } from '../../../shared/entities/alerta-emergencia.entity';

export class CrearAlertaDto {
  @IsEnum(['SOLICITUD_APOYO', 'SOLICITUD_CHOFER'] as const)
  tipo!: TipoAlertaEmergencia;

  /**
   * UUID v4 generado por el movil para ESTA pulsacion intencional.
   * Reintentos de red con la misma clave devuelven la alerta ya creada.
   */
  @IsString()
  @Length(8, 64)
  claveIdempotencia!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  detalle?: string;

  @IsOptional()
  @IsLatitude()
  latitud?: number;

  @IsOptional()
  @IsLongitude()
  longitud?: number;
}

export class CambiarEstadoAlertaDto {
  @IsEnum(['ATENDIDA', 'CANCELADA'] as const)
  estado!: 'ATENDIDA' | 'CANCELADA';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class ListarAlertasDto {
  @IsOptional()
  @IsEnum(['PENDIENTE', 'ATENDIDA', 'CANCELADA'] as const)
  estado?: 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA';

  @IsOptional()
  @IsUUID()
  solicitanteId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  limite?: string;
}
