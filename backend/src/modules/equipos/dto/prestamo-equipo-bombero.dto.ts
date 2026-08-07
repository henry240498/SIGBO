import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CrearPrestamoDto {
  @ApiProperty({ description: 'equipos.equipos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  equipoId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class DevolucionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
