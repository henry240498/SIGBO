import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class VehiculoAutorizadoDto {
  @ApiProperty() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) vehiculoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() categoria?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaAutorizacion?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() vigencia?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() capacitaciones?: string;
}

export class SetVehiculosAutorizadosDto {
  @ApiProperty({ type: [VehiculoAutorizadoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehiculoAutorizadoDto)
  vehiculos: VehiculoAutorizadoDto[];
}
