import { PartialType } from '@nestjs/swagger';
import { CreateTipoBomberoDto } from './create-tipo-bombero.dto';

export class UpdateTipoBomberoDto extends PartialType(CreateTipoBomberoDto) {}
