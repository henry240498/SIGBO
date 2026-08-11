import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BajaVehiculoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() motivoBaja?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaBaja?: string;
}
