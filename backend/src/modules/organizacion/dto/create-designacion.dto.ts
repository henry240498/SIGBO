import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateDesignacionDto {
  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cargoId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  companiaId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cuartelId?: string;

  @ApiProperty() @IsDateString() fechaDesde: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
