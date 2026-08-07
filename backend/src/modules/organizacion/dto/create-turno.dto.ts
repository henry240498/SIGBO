import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
const HORA_REGEX_MENSAJE = 'debe tener el formato HH:MM:SS';

export class CreateTurnoDto {
  @ApiProperty({ example: 'T-A' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'Turno A' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ required: false, example: '07:00:00' })
  @IsOptional()
  @Matches(HORA_REGEX, { message: `horaInicio ${HORA_REGEX_MENSAJE}` })
  horaInicio?: string;

  @ApiProperty({ required: false, example: '19:00:00' })
  @IsOptional()
  @Matches(HORA_REGEX, { message: `horaFin ${HORA_REGEX_MENSAJE}` })
  horaFin?: string;

  @ApiProperty({ required: false, description: 'Id del bombero responsable (uniqueidentifier)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableBomberoId?: string;

  @ApiProperty({ required: false, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;
}
