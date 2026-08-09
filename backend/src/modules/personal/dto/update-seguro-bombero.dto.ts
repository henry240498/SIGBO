import { PartialType } from '@nestjs/swagger';
import { CreateSeguroBomberoDto } from './create-seguro-bombero.dto';

export class UpdateSeguroBomberoDto extends PartialType(CreateSeguroBomberoDto) {}
