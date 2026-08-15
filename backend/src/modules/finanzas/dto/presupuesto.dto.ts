import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreatePresupuestoDto {
  @ApiProperty() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) ejercicioId: string;
  @ApiProperty({ description: 'organizacion.parametros.id (tipo CATEGORIA_EGRESO_FINANZAS)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaEgresoId: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) montoPresupuestado: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}

export class UpdatePresupuestoDto {
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) montoPresupuestado: number;
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo CATEGORIA_EGRESO_FINANZAS) -- cambia a que esta destinado el presupuesto' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaEgresoId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
