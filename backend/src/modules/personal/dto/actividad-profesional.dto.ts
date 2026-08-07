import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ActividadProfesionalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profesion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cargoLaboral?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  experiencia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  actividadesRelacionadas?: string;
}
