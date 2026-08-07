import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class TelefonoDto {
  @ApiProperty() @IsString() @MaxLength(30) numero: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  etiqueta?: string;
}

export class CorreoDto {
  @ApiProperty() @IsString() @MaxLength(255) correo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  etiqueta?: string;
}

export class ActualizarPerfilDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  facebookUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instagramUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  xUrl?: string;

  @ApiProperty({ required: false, type: [TelefonoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelefonoDto)
  telefonos?: TelefonoDto[];

  @ApiProperty({ required: false, type: [CorreoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorreoDto)
  correos?: CorreoDto[];
}
