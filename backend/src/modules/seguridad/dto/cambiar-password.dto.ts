import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { MaxBytesBcrypt, PASSWORD_REGEX, PASSWORD_REGEX_MENSAJE } from '../../../shared/utils/password-policy';

export class CambiarPasswordDto {
  @ApiProperty() @IsString() @MaxBytesBcrypt() passwordActual: string;

  @ApiProperty()
  @IsString()
  @MaxBytesBcrypt()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MENSAJE })
  passwordNueva: string;
}
