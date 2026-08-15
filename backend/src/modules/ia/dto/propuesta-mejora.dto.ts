import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePropuestaMejoraDto {
  @ApiProperty() @IsString() @MinLength(3) problemaDetectado: string;
  @ApiProperty() @IsString() @MinLength(3) propuestaTexto: string;
}

export class DecidirPropuestaMejoraDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() motivoDecision?: string;
}
