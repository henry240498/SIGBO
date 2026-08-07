import { PartialType } from '@nestjs/swagger';
import { CreateBrigadaDto } from './create-brigada.dto';

export class UpdateBrigadaDto extends PartialType(CreateBrigadaDto) {}
