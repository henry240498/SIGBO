import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS = ['DEPOSITO', 'TRANSFERENCIA', 'DEBITO', 'CREDITO', 'COMISION', 'OTRO'];

export class CreateMovimientoBancarioDto {
  @ApiProperty() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) cuentaBancariaId: string;
  @ApiProperty({ enum: TIPOS }) @IsIn(TIPOS) tipo: string;
  @ApiProperty() @IsISO8601() fecha: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) importe: number;
  @ApiProperty() @IsString() descripcion: string;
  @ApiProperty({ required: false, description: 'finanzas.movimientos_financieros.id -- operacion asociada' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  movimientoFinancieroId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class ConciliarMovimientoBancarioDto {
  @ApiProperty({ enum: ['CONCILIADO', 'DIFERENCIA'] }) @IsIn(['CONCILIADO', 'DIFERENCIA']) estadoConciliacion: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
