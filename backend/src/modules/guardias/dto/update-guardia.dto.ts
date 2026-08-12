import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateGuardiaDto } from './create-guardia.dto';

const ESTADOS = ['PLANIFICADA', 'CONFIRMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'ANULADA'];

export class UpdateGuardiaDto extends PartialType(CreateGuardiaDto) {
  @ApiProperty({ required: false, enum: ESTADOS })
  @IsOptional()
  @IsIn(ESTADOS)
  estado?: string;
}

export class AnularGuardiaDto {
  @ApiProperty() @IsString() motivo: string;
}
