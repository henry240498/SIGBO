import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['ACTIVO', 'INACTIVO'];

export class CreateGrupoGuardiaDto {
  @ApiProperty() @IsString() @MinLength(1) nombre: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  oficialACargoId?: string;

  @ApiProperty({ required: false, enum: ESTADOS, default: 'ACTIVO' }) @IsOptional() @IsIn(ESTADOS) estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}

export class UpdateGrupoGuardiaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(1) nombre?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  oficialACargoId?: string | null;

  @ApiProperty({ required: false, enum: ESTADOS }) @IsOptional() @IsIn(ESTADOS) estado?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}
