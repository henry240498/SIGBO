import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Solo para clientes API que no usan la cookie HttpOnly.' })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  refreshToken?: string;
}
