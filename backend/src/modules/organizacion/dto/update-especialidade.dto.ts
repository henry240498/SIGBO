import { PartialType } from '@nestjs/swagger';
import { CreateEspecialidadDto } from './create-especialidade.dto';

export class UpdateEspecialidadDto extends PartialType(CreateEspecialidadDto) {}
