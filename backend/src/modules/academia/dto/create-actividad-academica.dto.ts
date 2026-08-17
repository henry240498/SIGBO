import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS_ACTIVIDAD = ['PLANIFICADA', 'ABIERTA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];

export class CreateActividadAcademicaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_ACTIVIDAD_ACADEMICA)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoActividadId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() objetivo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() institucionOrganizadora?: string;

  @ApiProperty() @IsString() @IsNotEmpty() fechaInicio: string;
  @ApiProperty() @IsString() @IsNotEmpty() fechaFin: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() horaInicio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() horaFin?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() duracionHoras?: number;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo MODALIDAD_ACADEMICA)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  modalidadId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() lugar?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableBomberoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() cupo?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() requisitos?: string;

  @ApiProperty({ required: false, description: 'Costo de la actividad -- vacio si no cobra. Base para el descuento de Socios Protectores (nunca se modifica al aplicar un beneficio).' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  costo?: number;

  @ApiProperty({ required: false, enum: ESTADOS_ACTIVIDAD, default: 'PLANIFICADA' })
  @IsOptional()
  @IsIn(ESTADOS_ACTIVIDAD)
  estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;

  @ApiProperty({ required: false, default: false, description: 'Capacitacion realizada fuera de la institucion (seccion 18)' })
  @IsOptional()
  @IsBoolean()
  esExterna?: boolean;
}
