import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RegistrarHorarioDto {
  @ApiProperty({ required: false, description: 'ISO 8601' }) @IsOptional() @IsString() horaEntrada?: string;
  @ApiProperty({ required: false, description: 'ISO 8601' }) @IsOptional() @IsString() horaSalida?: string;
}
