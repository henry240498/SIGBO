import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class AsignarPermisoDirectoDto {
  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  permisoId: string;

  @ApiProperty() @IsBoolean() concedido: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}
