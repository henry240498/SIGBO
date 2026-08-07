import { PartialType } from '@nestjs/swagger';
import { CreateDesignacionDto } from './create-designacion.dto';

export class UpdateDesignacionDto extends PartialType(CreateDesignacionDto) {}
