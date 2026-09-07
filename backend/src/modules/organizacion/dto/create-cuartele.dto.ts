import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateCuartelDto {
  @ApiProperty() @IsString() @IsNotEmpty() codigo: string;

  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;

  @ApiProperty({ description: 'Id de la compania (uniqueidentifier)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  companiaId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ required: false, description: 'Id del bombero responsable (uniqueidentifier)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableBomberoId?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;

  @ApiProperty({ required: false, description: 'Para el marcador "Cuartel" y la distancia de las pruebas de comunicación en Servicios > Seguimiento Geográfico' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90)
  latitud?: number;

  @ApiProperty({ required: false })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(-180) @Max(180)
  longitud?: number;
}
