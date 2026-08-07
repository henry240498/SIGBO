import { PartialType } from '@nestjs/swagger';
import { CreateCompaniaDto } from './create-compania.dto';

export class UpdateCompaniaDto extends PartialType(CreateCompaniaDto) {}
