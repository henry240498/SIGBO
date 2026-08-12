import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CerrarGuardiaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;

  @ApiProperty({
    required: false,
    description:
      'personal.bomberos.id del responsable del cierre. Si se omite, se usa el bombero vinculado al usuario que cierra (si tiene uno) o el jefe de guardia asignado.',
  })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;
}

export class ReabrirGuardiaDto {
  @ApiProperty() @IsString() @IsNotEmpty() motivo: string;
}
