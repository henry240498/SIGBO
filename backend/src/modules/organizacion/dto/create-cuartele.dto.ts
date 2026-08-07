import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
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
}
