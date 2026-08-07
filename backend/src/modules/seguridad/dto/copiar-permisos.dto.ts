import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CopiarPermisosDto {
  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  rolOrigenId: string;
}
