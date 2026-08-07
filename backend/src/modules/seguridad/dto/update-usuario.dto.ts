import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class UpdateUsuarioDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_VERIFICACION'] })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_VERIFICACION'])
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  idioma?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zonaHoraria?: string;
}
