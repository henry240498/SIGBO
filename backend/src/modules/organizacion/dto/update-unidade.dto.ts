import { PartialType } from '@nestjs/swagger';
import { CreateUnidadDto } from './create-unidade.dto';

export class UpdateUnidadDto extends PartialType(CreateUnidadDto) {}
