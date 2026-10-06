import { IsDateString, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CrearDespachoDto {
  /** Id generado por la app: permite encadenar los pasos siguientes sin conexion y hace
   * idempotente el reintento (el mismo id nunca crea dos despachos). */
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  servicioId!: string;

  @IsUUID()
  vehiculoId!: string;

  /** Bombero que conduce (opcional: puede asignarse despues en la guardia). */
  @IsOptional()
  @IsUUID()
  conductorId?: string;

  /** Hora real del hecho si se registro sin conexion (se acota; ver instanteDelHecho). */
  @IsOptional()
  @IsDateString()
  ocurridoEn?: string;

  /** Kilometraje al salir; si falta se toma el del movil. */
  @IsOptional()
  @IsInt()
  @Min(0)
  kmSalida?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

/** Datos opcionales de cada paso del despacho (llegada, fin, regreso). */
export class RegresoDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  kmRegreso?: number;

  @IsOptional()
  @IsDateString()
  ocurridoEn?: string;
}

/** Cancelar un despacho o devolver un movil al cuartel exige dejar el motivo. */
export class MotivoDto {
  @IsString()
  @MaxLength(500)
  motivo!: string;
}

/** Posicion reportada por el dispositivo del movil (app movil). */
export class ReportarPosicionDto {
  @IsLatitude()
  latitud!: number;

  @IsLongitude()
  longitud!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(400)
  velocidadKmh?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precisionM?: number;

  /** Hora de la lectura en el dispositivo; si falta se usa la del servidor. */
  @IsOptional()
  @IsDateString()
  registradoEn?: string;
}
