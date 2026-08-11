import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateRequisitoRolDto {
  @ApiProperty({ description: 'p.ej. OFICIAL_A_CARGO, CHOFER' }) @IsString() @MinLength(1) rol: string;

  @ApiProperty({ required: false, description: 'organizacion.cargos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cargoIdRequerido?: string;

  @ApiProperty({ required: false, description: 'organizacion.rangos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  rangoIdRequerido?: string;

  @ApiProperty({ required: false, description: 'personal.tipos_bombero.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoBomberoIdRequerido?: string;
}
