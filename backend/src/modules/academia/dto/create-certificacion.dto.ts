import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Matches, Min } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_CERTIFICACION = ['BASICO', 'INTERMEDIO', 'AVANZADO', 'ESPECIALIDAD', 'CURSO', 'SEMINARIO', 'TALLER', 'ENTRENAMIENTO'];
const ESTADOS_CERTIFICACION = ['VIGENTE', 'VENCIDO', 'EN_PROCESO'];

/** SIGBO nunca genera esta certificacion sola: el bombero (o quien tenga
 * academia:certificar) es responsable de registrarla y, si corresponde,
 * adjuntar el archivo del certificado (seccion 14-15 del pedido). */
export class CreateCertificacionDto {
  @ApiProperty({ description: 'personal.bomberos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  bomberoId: string;

  @ApiProperty({ enum: TIPOS_CERTIFICACION })
  @IsIn(TIPOS_CERTIFICACION)
  tipo: string;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  institucion?: string;

  @ApiProperty()
  @IsISO8601()
  fechaObtencion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  fechaVencimiento?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numeroCertificado?: string;

  @ApiProperty({ required: false, enum: ESTADOS_CERTIFICACION, default: 'VIGENTE' })
  @IsOptional()
  @IsIn(ESTADOS_CERTIFICACION)
  estado?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duracionHoras?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiProperty({ required: false, description: 'academia.actividades.id -- si el certificado corresponde a una actividad interna' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  actividadAcademicaId?: string;
}
