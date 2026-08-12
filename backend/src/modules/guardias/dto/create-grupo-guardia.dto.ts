import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['ACTIVO', 'INACTIVO'];

export class CreateGrupoGuardiaDto {
  @ApiProperty() @IsString() @MinLength(1) nombre: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  oficialACargoId?: string;

  @ApiProperty({ required: false, enum: ESTADOS, default: 'ACTIVO' }) @IsOptional() @IsIn(ESTADOS) estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;

  @ApiProperty({ required: false, description: 'Cada cuantos dias vuelve a corresponderle una guardia a este grupo' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cicloRotacionDias?: number;

  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) cantidadMinima?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) cantidadMaxima?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) cantidadOficiales?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(0) cantidadChoferes?: number;
}

export class UpdateGrupoGuardiaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(1) nombre?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  oficialACargoId?: string | null;

  @ApiProperty({ required: false, enum: ESTADOS }) @IsOptional() @IsIn(ESTADOS) estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;

  @ApiProperty({ required: false, nullable: true, description: 'Cada cuantos dias vuelve a corresponderle una guardia a este grupo' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cicloRotacionDias?: number | null;

  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadMinima?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadMaxima?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadOficiales?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadChoferes?: number | null;
}
