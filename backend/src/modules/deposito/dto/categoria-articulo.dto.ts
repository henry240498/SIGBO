import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateCategoriaArticuloDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  padreId?: string;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() activo?: boolean;
}

export class UpdateCategoriaArticuloDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() nombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  padreId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() activo?: boolean;
}
