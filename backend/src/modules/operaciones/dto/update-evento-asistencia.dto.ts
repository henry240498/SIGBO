import { PartialType } from '@nestjs/swagger';
import { CreateEventoAsistenciaDto } from './create-evento-asistencia.dto';

export class UpdateEventoAsistenciaDto extends PartialType(CreateEventoAsistenciaDto) {}
