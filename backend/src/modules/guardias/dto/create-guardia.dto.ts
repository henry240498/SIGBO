import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TURNOS = ['DIURNO', 'NOCTURNO', 'COMPLETO'];
const TIPOS = ['ORDINARIA', 'ESPECIAL', 'EXTRAORDINARIA'];

export class CreateGuardiaDto {
  @ApiProperty() @IsString() @IsNotEmpty() fecha: string;
  @ApiProperty({ enum: TURNOS }) @IsIn(TURNOS) turno: string;
  @ApiProperty({ description: 'HH:mm' }) @IsString() @IsNotEmpty() horaInicio: string;
  @ApiProperty({ description: 'HH:mm' }) @IsString() @IsNotEmpty() horaFin: string;

  @ApiProperty({ required: false, enum: TIPOS, default: 'ORDINARIA' })
  @IsOptional()
  @IsIn(TIPOS)
  tipo?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  jefeGuardiaId?: string;

  @ApiProperty({
    required: false,
    description: 'operaciones.grupos_guardia.id -- si se indica, se recupera automaticamente su personal titular',
  })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  grupoGuardiaId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;

  @ApiProperty({ required: false, description: 'operaciones.esquemas_horario_guardia.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  esquemaHorarioId?: string;

  @ApiProperty({ required: false, description: 'organizacion.feriados.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  feriadoId?: string;
}
