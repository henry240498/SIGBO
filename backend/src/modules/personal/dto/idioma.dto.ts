import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class IdiomaDto {
  @ApiProperty() @IsString() @IsNotEmpty() idioma: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificacion?: string;
}

export class SetIdiomasDto {
  @ApiProperty({ type: [IdiomaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdiomaDto)
  idiomas: IdiomaDto[];
}
