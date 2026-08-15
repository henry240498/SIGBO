import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

const FORMALIDADES = ['BAJA', 'MEDIA', 'ALTA'];

export class UpdateConfiguracionIaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() personaje?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() personalidad?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() saludo?: string;
  @ApiProperty({ required: false, enum: FORMALIDADES }) @IsOptional() @IsIn(FORMALIDADES) formalidad?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() permiteEmojis?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() instruccionesInstitucionales?: string;
  @ApiProperty({ required: false, description: 'Activa el limitador de consultas por usuario (proteccion tecnica anti-abuso, apagado = "sin limites")' }) @IsOptional() @IsBoolean() limiteActivo?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) limiteConsultasMinuto?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsInt() @Min(1) limiteConsultasHora?: number;
  @ApiProperty({ required: false, type: [String], description: "Slugs de modulo habilitados para las herramientas de la IA, ej. ['personal','guardias']" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modulosHabilitados?: string[];
  @ApiProperty({ required: false, description: 'Motivo del cambio, queda en el historial de configuracion' }) @IsOptional() @IsString() motivo?: string;
}

export class CambiarEstadoIaDto {
  @ApiProperty({ enum: ['ACTIVA', 'INACTIVA', 'MANTENIMIENTO'] }) @IsIn(['ACTIVA', 'INACTIVA', 'MANTENIMIENTO']) estado: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
  @ApiProperty({ required: false, description: 'Mensaje mostrado al usuario cuando estado = MANTENIMIENTO' }) @IsOptional() @IsString() mensajeMantenimiento?: string;
}

export class SeleccionarAvatarPredefinidoDto {
  @ApiProperty({ description: 'Un emoji (ej. "🐶")' })
  @IsString()
  @MaxLength(10)
  emoji: string;

  @ApiProperty({ description: 'Color de fondo en hex (ej. "#334155")' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'colorFondo debe ser un color hex valido, ej. #334155' })
  colorFondo: string;
}

export class EliminarIaDto {
  @ApiProperty({ description: 'Debe ser exactamente "DELETE" para confirmar el borrado definitivo' })
  @IsString()
  confirmacion: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
}
