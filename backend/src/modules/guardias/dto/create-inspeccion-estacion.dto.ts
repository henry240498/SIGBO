import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['OK', 'NO_OK'];

export class CreateInspeccionEstacionDto {
  @ApiProperty({ description: 'organizacion.parametros.id (tipo SECTOR_ESTACION)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  sector: string;

  @ApiProperty({ enum: ESTADOS }) @IsIn(ESTADOS) estado: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;
}
