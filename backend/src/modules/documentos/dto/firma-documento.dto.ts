import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class FirmanteRequeridoDto {
  @ApiProperty({ required: false, description: 'organizacion.cargos.id -- se resuelve automaticamente quien lo ocupa hoy' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cargoFirmanteId?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id -- persona puntual, alternativa a cargoFirmanteId' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoFirmanteId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() etiquetaRol?: string;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() orden?: number;
}

export class DefinirFirmantesDto {
  @ApiProperty({ type: [FirmanteRequeridoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FirmanteRequeridoDto)
  firmantes: FirmanteRequeridoDto[];
}

export class ConfirmarFirmaManualDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
