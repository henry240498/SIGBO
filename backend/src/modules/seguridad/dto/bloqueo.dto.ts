import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class BloqueoDto {
  @ApiProperty({ description: 'true para bloquear, false para desbloquear' })
  @IsBoolean()
  bloquear: boolean;

  @ApiProperty({ required: false, description: 'Minutos de bloqueo; si se omite y bloquear=true, el bloqueo es indefinido' })
  @IsOptional()
  @IsInt()
  @Min(1)
  minutos?: number;
}
