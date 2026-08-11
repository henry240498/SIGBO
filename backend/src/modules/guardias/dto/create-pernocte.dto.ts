import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreatePernocteDto {
  @ApiProperty({ required: false, description: 'operaciones.guardias.id (opcional, solo como contexto)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  guardiaId?: string;

  @ApiProperty() @IsString() @IsNotEmpty() fecha: string;

  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ required: false, description: 'ISO 8601' }) @IsOptional() @IsString() horaEntrada?: string;
  @ApiProperty({ required: false, description: 'ISO 8601' }) @IsOptional() @IsString() horaSalida?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
