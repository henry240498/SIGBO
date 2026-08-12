import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreateEsquemaHorarioDto {
  @ApiProperty() @IsString() @MinLength(1) nombre: string;

  @ApiProperty({ required: false, description: 'CSV de LUN,MAR,MIE,JUE,VIE,SAB,DOM; vacio = solo feriados/especial' })
  @IsOptional()
  @Matches(/^(LUN|MAR|MIE|JUE|VIE|SAB|DOM)(,(LUN|MAR|MIE|JUE|VIE|SAB|DOM))*$/, {
    message: 'debe ser una lista separada por comas de LUN,MAR,MIE,JUE,VIE,SAB,DOM',
  })
  diasSemanaCsv?: string;

  @ApiProperty({ description: 'HH:mm' }) @IsString() @MinLength(1) horaInicio: string;
  @ApiProperty({ description: 'HH:mm' }) @IsString() @MinLength(1) horaFin: string;

  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() cruzaMedianoche?: boolean;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @IsInt() @Min(1) diasDuracion?: number;
  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() esEspecial?: boolean;
  @ApiProperty({ required: false, default: false, description: 'Si TRUE, la generacion automatica usa rotacion de grupo; si FALSE, asigna personal individual' })
  @IsOptional()
  @IsBoolean()
  usaRotacionGrupo?: boolean;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() requiereOficial?: boolean;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() requiereChofer?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() cantidadMinima?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() cantidadMaxima?: number;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @IsInt() cantidadOficiales?: number;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @IsInt() cantidadChoferes?: number;
  @ApiProperty({ required: false, default: 0 }) @IsOptional() @IsInt() orden?: number;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() activo?: boolean;
}
