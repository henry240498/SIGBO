import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MaxBytesBcrypt } from '../../../shared/utils/password-policy';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  usernameOrEmail: string;

  @ApiProperty({ example: 'CambiarEsta123!' })
  @IsString()
  @IsNotEmpty()
  @MaxBytesBcrypt()
  password: string;
}
