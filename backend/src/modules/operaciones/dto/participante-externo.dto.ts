import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ParticipanteExternoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() cedula?: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() apellido?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() celular?: string;
  @ApiProperty({ required: false, description: 'Institucion de procedencia del visitante (ej. "Colegio Nacional")' })
  @IsOptional()
  @IsString()
  institucionProcedencia?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
