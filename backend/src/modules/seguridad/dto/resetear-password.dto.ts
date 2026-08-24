import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { MaxBytesBcrypt, PASSWORD_REGEX, PASSWORD_REGEX_MENSAJE } from '../../../shared/utils/password-policy';

export class ResetearPasswordDto {
  @ApiProperty()
  @IsString()
  @MaxBytesBcrypt()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MENSAJE })
  passwordNueva: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  forzarCambio?: boolean;
}
