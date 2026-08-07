import { PartialType } from '@nestjs/swagger';
import { CreateCuartelDto } from './create-cuartele.dto';

export class UpdateCuartelDto extends PartialType(CreateCuartelDto) {}
