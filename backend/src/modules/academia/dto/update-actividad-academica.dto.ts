import { PartialType } from '@nestjs/swagger';
import { CreateActividadAcademicaDto } from './create-actividad-academica.dto';

export class UpdateActividadAcademicaDto extends PartialType(CreateActividadAcademicaDto) {}
