import { PartialType } from '@nestjs/swagger';
import { CreateTipoGuardiaDto } from './create-tipo-guardia.dto';

export class UpdateTipoGuardiaDto extends PartialType(CreateTipoGuardiaDto) {}
