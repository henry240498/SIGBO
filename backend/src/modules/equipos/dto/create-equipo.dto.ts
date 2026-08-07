import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';
import { EstadoEquipo } from '../../../shared/entities/equipo.entity';

const ESTADOS_EQUIPO: EstadoEquipo[] = [
  'OPERATIVO',
  'EN_MANTENIMIENTO',
  'DANIADO',
  'BAJA',
  'PRESTADO',
];

export class CreateEquipoDto {
  @ApiProperty({ description: 'equipos.categorias_equipo.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  categoriaId: string;

  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50) codigoInterno: string;

  @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  marca?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroSerie?: string;

  @ApiProperty({ required: false, enum: ESTADOS_EQUIPO, default: 'OPERATIVO' })
  @IsOptional()
  @IsIn(ESTADOS_EQUIPO)
  estado?: EstadoEquipo;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id (responsable)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  fechaCompra?: string;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  fechaVencimiento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  vidaUtilMeses?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  qrCode?: string;
}
