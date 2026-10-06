import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
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

  /**
   * "Mantener sesion iniciada". Sin indicar nada rige el comportamiento de siempre (REFRESH_TOKEN_EXPIRATION).
   * true: sesion larga que se renueva con el uso. false: sesion corta, hay que volver a autenticarse.
   */
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  mantenerSesion?: boolean;

  /** Modelo o nombre del equipo, solo para la auditoria. */
  @ApiProperty({ required: false, example: 'Xiaomi 2409BRN2CL' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dispositivo?: string;
}
