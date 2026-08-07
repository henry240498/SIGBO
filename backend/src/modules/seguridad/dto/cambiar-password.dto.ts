import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_REGEX_MENSAJE } from '../../../shared/utils/password-policy';

export class CambiarPasswordDto {
  @ApiProperty() @IsString() passwordActual: string;

  @ApiProperty()
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MENSAJE })
  passwordNueva: string;
}
