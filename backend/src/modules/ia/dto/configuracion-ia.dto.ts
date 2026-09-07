import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

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
  @ApiProperty({ required: false, description: 'Antepone a cada respuesta como se interpreto la consulta (modulo, intencion, filtros)' })
  @IsOptional()
  @IsBoolean()
  explicarInterpretacion?: boolean;
  @ApiProperty({ required: false, type: [String], description: "Slugs de modulo habilitados para las herramientas de la IA, ej. ['personal','guardias']" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modulosHabilitados?: string[];

  @ApiProperty({ required: false, description: 'Motor local de Ollama: encendido/apagado. Nace en false -- no cambia nada hasta que un administrador lo prenda.' })
  @IsOptional() @IsBoolean() ollamaHabilitado?: boolean;

  @ApiProperty({ required: false, example: 'http://localhost' }) @IsOptional() @IsString() @MaxLength(200) ollamaUrl?: string;

  @ApiProperty({ required: false, example: 11434 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(65535) ollamaPuerto?: number;

  @ApiProperty({ required: false, description: 'Nombre exacto del modelo instalado, ej. "llama3.2:3b"' })
  @IsOptional() @IsString() @MaxLength(100) ollamaModelo?: string;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(500) @Max(120000) ollamaTimeoutMs?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1) ollamaTemperatura?: number;

  @ApiProperty({ required: false, description: 'Voz (STT/TTS local): encendido/apagado general. Nace en false.' })
  @IsOptional() @IsBoolean() vozHabilitada?: boolean;

  @ApiProperty({ required: false, description: 'Permite hablarle a Snoopy por micrófono (independiente de si responde con voz)' })
  @IsOptional() @IsBoolean() entradaVozHabilitada?: boolean;

  @ApiProperty({ required: false, description: 'Permite que Snoopy responda en voz alta (independiente de si acepta entrada por micrófono)' })
  @IsOptional() @IsBoolean() respuestaVozHabilitada?: boolean;

  @ApiProperty({ required: false, minimum: 0, maximum: 1, description: 'Volumen de reproducción, aplicado en el navegador' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1) vozVolumen?: number;

  @ApiProperty({ required: false, minimum: 0.5, maximum: 2, description: 'Velocidad de reproducción, aplicada en el navegador' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.5) @Max(2) vozVelocidad?: number;

  @ApiProperty({ required: false, description: 'Nombre del archivo de voz de Piper ya instalado, ej. "es_AR-daniela-high"' })
  @IsOptional() @IsString() @MaxLength(150) vozSeleccionada?: string;

  @ApiProperty({ required: false, example: 'es' }) @IsOptional() @IsString() @MaxLength(10) vozIdioma?: string;

  @ApiProperty({ required: false, example: 'http://localhost' }) @IsOptional() @IsString() @MaxLength(200) whisperUrl?: string;

  @ApiProperty({ required: false, example: 8090 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(65535) whisperPuerto?: number;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(500) @Max(120000) whisperTimeoutMs?: number;

  @ApiProperty({ required: false, description: 'Ruta completa al ejecutable piper.exe' })
  @IsOptional() @IsString() @MaxLength(400) piperRutaBinario?: string;

  @ApiProperty({ required: false, description: 'Ruta completa al archivo .onnx de la voz seleccionada' })
  @IsOptional() @IsString() @MaxLength(400) piperRutaVoz?: string;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(500) @Max(120000) piperTimeoutMs?: number;

  @ApiProperty({ required: false, description: 'Motivo del cambio, queda en el historial de configuracion' }) @IsOptional() @IsString() motivo?: string;
}

export class ProbarGeneracionOllamaDto {
  @ApiProperty({ required: false, description: 'Prompt de prueba; si se omite se usa uno por defecto' })
  @IsOptional() @IsString() @MaxLength(500)
  prompt?: string;
}

export class ProbarPiperDto {
  @ApiProperty({ required: false, description: 'Texto de prueba; si se omite se usa uno por defecto' })
  @IsOptional() @IsString() @MaxLength(500)
  texto?: string;
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
