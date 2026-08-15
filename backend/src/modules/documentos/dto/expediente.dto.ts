import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

const ESTADOS = ['ABIERTO', 'CERRADO'];

export class CreateExpedienteDto {
  @ApiProperty() @IsString() numero: string;
  @ApiProperty() @IsString() titulo: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
}

export class UpdateExpedienteDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() titulo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false, enum: ESTADOS }) @IsOptional() @IsIn(ESTADOS) estado?: string;
}
