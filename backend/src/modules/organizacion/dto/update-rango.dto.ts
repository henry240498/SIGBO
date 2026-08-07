import { PartialType } from '@nestjs/swagger';
import { CreateRangoDto } from './create-rango.dto';

export class UpdateRangoDto extends PartialType(CreateRangoDto) {}
