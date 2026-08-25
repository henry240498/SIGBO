import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TURNOS = ['DIURNO', 'NOCTURNO', 'COMPLETO'];

export class ItemPlanificacionGuardiaDto {
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) guardiaId?: string;
  @IsString() @IsNotEmpty() fecha: string;
  @IsIn(TURNOS) turno: string;
  @IsString() @IsNotEmpty() horaInicio: string;
  @IsString() @IsNotEmpty() horaFin: string;
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) grupoGuardiaId: string;
  @IsOptional() @IsString() observaciones?: string;
}

/** Carga operativa de la grilla: guarda hechos planificados, no aprueba ni
 * publica la Orden de Servicio. */
export class PlanificarGuardiasDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemPlanificacionGuardiaDto)
  items: ItemPlanificacionGuardiaDto[];

  @IsOptional() @IsBoolean()
  reemplazarPlanificadas?: boolean;
}
