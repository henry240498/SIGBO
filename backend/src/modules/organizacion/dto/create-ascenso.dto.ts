import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateAscensoDto {
  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ description: 'Nuevo rango. El rango anterior se toma automaticamente del bombero.' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  rangoNuevoId: string;

  @ApiProperty() @IsDateString() fecha: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resolucion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
