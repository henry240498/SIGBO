import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsISO8601, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ORIGENES = ['INTERNO', 'EXTERNO'];

export class CreateDocumentoDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_DOCUMENTO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoDocumentoId: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo CATEGORIA_DOCUMENTO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaDocumentoId?: string;

  @ApiProperty() @IsString() titulo: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ enum: ORIGENES, default: 'INTERNO' }) @IsIn(ORIGENES) origen: string;
  @ApiProperty() @IsISO8601() fechaEmision: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaInicioVigencia?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaVencimiento?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo NIVEL_CONFIDENCIALIDAD_DOCUMENTO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  nivelConfidencialidadId?: string;

  @ApiProperty({ required: false, description: 'Auto-genera el numero documental por tipo+anio si es true' })
  @IsOptional()
  @IsBoolean()
  autoNumerar?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsString() numeroDocumental?: string;

  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() esFisico?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) archivoFisicoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() estante?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() caja?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() carpeta?: string;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) expedienteId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() ordenEnExpediente?: number;
}

export class UpdateDocumentoDto {
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) categoriaDocumentoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() titulo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaInicioVigencia?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaVencimiento?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) nivelConfidencialidadId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) expedienteId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() ordenEnExpediente?: number;
}

export class CambiarEstadoDocumentoDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo ESTADO_DOCUMENTO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  estadoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class AnularDocumentoDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo MOTIVO_ANULACION_DOCUMENTO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  motivoAnulacionId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() detalle?: string;
}

export class SubirArchivoDto {
  @ApiProperty({ required: false, description: 'Motivo del reemplazo -- requerido si ya existe un archivo vigente' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class CrearRelacionDto {
  @ApiProperty({ description: "slug del modulo, ej 'personal'" }) @IsString() modulo: string;
  @ApiProperty({ description: "nombre de la entidad, ej 'bombero'" }) @IsString() entidad: string;
  @ApiProperty() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) registroId: string;
  @ApiProperty({ required: false, description: 'Etiqueta legible congelada, ej "BC-102"' }) @IsOptional() @IsString() etiqueta?: string;
}
