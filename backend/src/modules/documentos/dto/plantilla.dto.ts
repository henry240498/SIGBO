import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsObject, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
import { CrearRelacionDto } from './documento.dto';

export class CreatePlantillaDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_DOCUMENTO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoDocumentoId?: string;

  @ApiProperty({ description: 'Texto con placeholders {{CAMPO}}' }) @IsString() contenido: string;

  @ApiProperty({ required: false, description: 'organizacion.cargos.id -- firmante por defecto' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cargoFirmanteId?: string;
}

export class UpdatePlantillaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contenido?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cargoFirmanteId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() activa?: boolean;
}

export class GenerarDesdePlantillaDto {
  @ApiProperty() @IsString() titulo: string;
  @ApiProperty() @IsISO8601() fechaEmision: string;
  @ApiProperty({ description: 'Valores para reemplazar cada {{CAMPO}} de la plantilla' })
  @IsObject()
  campos: Record<string, string>;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) categoriaDocumentoId?: string;
  @ApiProperty({ required: false, description: 'Sobreescribe el cargo firmante configurado en la plantilla' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cargoFirmanteId?: string;

  @ApiProperty({ required: false, description: 'Auto-genera el numero documental por tipo+anio' })
  @IsOptional()
  @IsBoolean()
  autoNumerar?: boolean;

  @ApiProperty({ required: false, type: [CrearRelacionDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CrearRelacionDto)
  relaciones?: CrearRelacionDto[];
}
