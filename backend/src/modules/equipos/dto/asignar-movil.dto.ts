import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class AsignarMovilDto {
  @ApiProperty({ required: false, nullable: true, description: 'vehiculos.vehiculos.id - null para desasignar' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  vehiculoId?: string | null;
}
