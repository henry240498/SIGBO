import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const AMBITOS = ['ACADEMIA', 'SERVICIOS', 'GENERAL'];
const ESTADOS = ['ACTIVO', 'INACTIVO'];

export class CreateBeneficioSocioDto {
  @ApiProperty() @IsString() @MaxLength(150) nombre: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo TIPO_BENEFICIO_SOCIO)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoId: string;

  @ApiProperty({ required: false, description: 'Al menos uno de porcentajeDescuento/montoFijoDescuento' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01) @Max(100)
  porcentajeDescuento?: number;

  @ApiProperty({ required: false })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01)
  montoFijoDescuento?: number;

  @ApiProperty({ enum: AMBITOS }) @IsIn(AMBITOS) ambito: string;

  @ApiProperty({ required: false, description: 'academia.actividades.id -- vacio = aplica a cualquier actividad del ambito ACADEMIA' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  actividadAcademicaId?: string;

  @ApiProperty({ required: false, description: 'servicios.tipos_servicio.id -- preparado, sin integracion activa todavia' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoServicioId?: string;

  @ApiProperty() @IsISO8601() fechaInicio: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaFin?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() condiciones?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}

export class UpdateBeneficioSocioDto extends PartialType(CreateBeneficioSocioDto) {
  @ApiProperty({ required: false, enum: ESTADOS })
  @IsOptional() @IsIn(ESTADOS)
  estado?: string;
}
