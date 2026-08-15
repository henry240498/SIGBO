import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Mismo shape que operaciones/dto/participante-externo.dto.ts -- Academia
 * reutiliza la entidad ParticipanteExterno tal cual, sin duplicar su CRUD. */
export class ParticipanteExternoAcademiaDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() cedula?: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() apellido?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() celular?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() institucionProcedencia?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;
}
