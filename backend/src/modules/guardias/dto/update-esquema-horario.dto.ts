import { PartialType } from '@nestjs/swagger';
import { CreateEsquemaHorarioDto } from './create-esquema-horario.dto';

export class UpdateEsquemaHorarioDto extends PartialType(CreateEsquemaHorarioDto) {}
