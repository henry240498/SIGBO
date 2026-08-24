import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { MaxBytesBcrypt, PASSWORD_REGEX, PASSWORD_REGEX_MENSAJE } from '../../../shared/utils/password-policy';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateUsuarioDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(3) username: string;

  @ApiProperty()
  @IsString()
  @MaxBytesBcrypt()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MENSAJE })
  password: string;

  @ApiProperty({ required: false, description: 'Vincula el usuario a un registro de Personal ya existente' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_VERIFICACION'] })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_VERIFICACION'])
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiProperty({ required: false, description: 'Si true, el usuario debera cambiar la contrasena en su primer inicio de sesion' })
  @IsOptional()
  @IsBoolean()
  debeCambiarPassword?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @Matches(GUID_REGEX, { each: true, message: GUID_REGEX_MENSAJE })
  rolesIds?: string[];
}
