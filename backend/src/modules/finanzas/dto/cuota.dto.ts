import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
import { DocumentoRespaldoInputDto } from './movimiento-financiero.dto';

export class CreateCuotaDto {
  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ description: "Formato 'YYYY-MM'" }) @IsString() periodo: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) importe: number;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaVencimiento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class PagarCuotaDto {
  @ApiProperty() @IsISO8601() fecha: string;
  @ApiProperty({ required: false, description: 'Default: importe pendiente de la cuota' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  importe?: number;

  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cajaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cuentaBancariaId?: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) responsableId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
  @ApiProperty({ required: false, type: DocumentoRespaldoInputDto })
  @IsOptional()
  documento?: DocumentoRespaldoInputDto;
}

export class AnularCuotaDto {
  @ApiProperty() @IsString() motivo: string;
}
