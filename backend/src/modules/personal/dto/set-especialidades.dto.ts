import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class EspecialidadAsignadaDto {
  @ApiProperty() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) especialidadId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaObtencion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nivel?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() institucionCertificadora?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() vigencia?: string;
}

export class SetEspecialidadesDto {
  @ApiProperty({ type: [EspecialidadAsignadaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EspecialidadAsignadaDto)
  especialidades: EspecialidadAsignadaDto[];
}
