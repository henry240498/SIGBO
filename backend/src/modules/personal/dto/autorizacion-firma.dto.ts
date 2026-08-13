import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class AutorizacionFirmaDto {
  @ApiProperty() @IsBoolean() autorizado: boolean;
}
