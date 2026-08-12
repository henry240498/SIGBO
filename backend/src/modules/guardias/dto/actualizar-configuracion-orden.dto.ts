import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class ActualizarConfiguracionOrdenDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() tituloDocumento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() textoHeaderInstitucional?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() textoIntroPlantilla?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() reglaTextoOficial?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() reglaTextoChofer?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() exigirRangoIgualOSuperiorOficial?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() textoPie?: string;

  @ApiProperty({ required: false, nullable: true, description: 'organizacion.cargos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  firmante1CargoId?: string | null;

  @ApiProperty({ required: false }) @IsOptional() @IsString() firmante1Etiqueta?: string;

  @ApiProperty({ required: false, nullable: true, description: 'organizacion.cargos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  firmante2CargoId?: string | null;

  @ApiProperty({ required: false }) @IsOptional() @IsString() firmante2Etiqueta?: string;
}
