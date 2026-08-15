import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InstructorExternoDto {
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() apellido?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() documento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() institucion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() especialidad?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefono?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() activo?: boolean;
}
