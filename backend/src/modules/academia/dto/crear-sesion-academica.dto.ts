import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

/** Una sesion/jornada de una actividad academica es un
 * operaciones.eventos_asistencia enlazado -- reutiliza asistencia sin
 * duplicar su estructura (seccion 9-10 del pedido). */
export class CrearSesionAcademicaDto {
  @ApiProperty({ required: false, description: 'Si se omite, usa el nombre de la actividad' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty()
  @IsISO8601()
  fechaInicio: string;

  @ApiProperty()
  @IsISO8601()
  fechaFin: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo TIPO_EVENTO_ASISTENCIA)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoEventoId?: string;

  @ApiProperty({ required: false, default: true, description: 'Si es true, inscribe automaticamente a los ya inscritos en la actividad como participantes de la sesion' })
  @IsOptional()
  @IsBoolean()
  inscribirParticipantesActuales?: boolean;
}
