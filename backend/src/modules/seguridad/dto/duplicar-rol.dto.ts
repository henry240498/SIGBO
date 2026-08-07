import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DuplicarRolDto {
  @ApiProperty() @IsString() @MinLength(2) nombreNuevo: string;
}
