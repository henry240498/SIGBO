import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateLoteArticuloDto {
  @ApiProperty({ description: 'deposito.articulos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  articuloId: string;

  @ApiProperty() @IsString() numeroLote: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaFabricacion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaVencimiento?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) cantidad: number;
}
