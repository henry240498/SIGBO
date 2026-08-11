import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrarSalidaPernocteDto {
  @ApiProperty({ description: 'ISO 8601' }) @IsString() @IsNotEmpty() horaSalida: string;
}
