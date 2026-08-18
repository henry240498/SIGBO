import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const ALINEACIONES_TITULO = ['IZQUIERDA', 'CENTRO', 'DERECHA'];

export class LineaDestacadaDto {
  @ApiProperty() @IsString() texto: string;
  @ApiProperty({ enum: ['SUBTITULO', 'DISTINCION', 'OTRO'] }) @IsString() tipo: 'SUBTITULO' | 'DISTINCION' | 'OTRO';
  @ApiProperty() @IsBoolean() visible: boolean;
  @ApiProperty() orden: number;
}

export class ActualizarIdentidadInstitucionalDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) nombreInstitucion?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(300) direccion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarDireccion?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(150) telefono?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarTelefono?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(255) email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarEmail?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(255) sitioWeb?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarSitioWeb?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(150) personeriaJuridica?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarPersoneria?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaFundacion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarFechaFundacion?: boolean;

  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarLogoIzquierda?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarLogoDerecha?: boolean;

  @ApiProperty({ required: false, enum: ALINEACIONES_TITULO, description: 'Alineacion del titulo/numero/fecha en la cabecera de cualquier documento generado por SIGBO' })
  @IsOptional()
  @IsIn(ALINEACIONES_TITULO)
  alineacionTitulo?: 'IZQUIERDA' | 'CENTRO' | 'DERECHA';

  @ApiProperty({ required: false, type: [LineaDestacadaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineaDestacadaDto)
  lineasDestacadas?: LineaDestacadaDto[];

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(500) textoPiePagina?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarNumeroPagina?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() mostrarGeneradoSigbo?: boolean;
}
