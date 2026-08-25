import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['ACTIVO', 'INACTIVO'];

export class CreateGrupoGuardiaDto {
  @ApiProperty() @IsString() @MinLength(1) nombre: string;

  @ApiProperty({ description: 'personal.bomberos.id: responsable a cargo de la guardia' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  oficialACargoId: string;

  @ApiProperty({ description: 'personal.bomberos.id: chofer habilitado que integra el grupo' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  choferId: string;

  @ApiProperty({ required: false, enum: ESTADOS, default: 'ACTIVO' }) @IsOptional() @IsIn(ESTADOS) estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;

  @ApiProperty({ required: false, description: 'Cada cuantos dias vuelve a corresponderle una guardia a este grupo' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cicloRotacionDias?: number;

  @ApiProperty({ required: false, description: 'CSV de LUN,MAR,MIE,JUE,VIE,SAB,DOM; restringe el grupo a esos días' })
  @IsOptional()
  @Matches(/^(LUN|MAR|MIE|JUE|VIE|SAB|DOM)(,(LUN|MAR|MIE|JUE|VIE|SAB|DOM))*$/, {
    message: 'debe ser una lista separada por comas de LUN,MAR,MIE,JUE,VIE,SAB,DOM',
  })
  diasSemanaCsv?: string;

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

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Matches(/^(LUN|MAR|MIE|JUE|VIE|SAB|DOM)(,(LUN|MAR|MIE|JUE|VIE|SAB|DOM))*$/, {
    message: 'debe ser una lista separada por comas de LUN,MAR,MIE,JUE,VIE,SAB,DOM',
  })
  diasSemanaCsv?: string | null;

  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadMinima?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadMaxima?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadOficiales?: number | null;
  @ApiProperty({ required: false, nullable: true }) @IsOptional() @IsInt() @Min(0) cantidadChoferes?: number | null;
}
