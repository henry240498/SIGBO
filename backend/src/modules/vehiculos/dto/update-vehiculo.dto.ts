import { PartialType } from '@nestjs/swagger';
import { CreateVehiculoDto } from './create-vehiculo.dto';

export class UpdateVehiculoDto extends PartialType(CreateVehiculoDto) {}
