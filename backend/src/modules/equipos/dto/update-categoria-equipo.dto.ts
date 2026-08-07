import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaEquipoDto } from './create-categoria-equipo.dto';

export class UpdateCategoriaEquipoDto extends PartialType(CreateCategoriaEquipoDto) {}
