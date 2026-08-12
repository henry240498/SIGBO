import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class GenerarSorteoDto {
  @ApiProperty({ description: 'YYYY-MM-DD' }) @IsString() @IsNotEmpty() fecha: string;
  @ApiProperty({ description: 'Motivo del sorteo, ej. "Navidad 2026"' }) @IsString() @IsNotEmpty() motivo: string;
  @ApiProperty({ description: 'Cantidad de personas a seleccionar' }) @IsInt() @Min(1) cantidadASeleccionar: number;

  @ApiProperty({ required: false, description: 'operaciones.esquemas_horario_guardia.id, si ya se sabe con que esquema se armara la guardia' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  esquemaHorarioId?: string;
}

export class CrearGuardiaDesdeSorteoDto {
  @ApiProperty({ required: false, description: 'Si el sorteo no tenia esquemaHorarioId definido, se puede indicar aqui' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  esquemaHorarioId?: string;
}
