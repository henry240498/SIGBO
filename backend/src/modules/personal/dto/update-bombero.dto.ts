import { PartialType } from '@nestjs/swagger';
import { CreateBomberoDto } from './create-bombero.dto';

export class UpdateBomberoDto extends PartialType(CreateBomberoDto) {}
