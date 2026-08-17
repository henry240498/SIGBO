import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const TIPOS_PERSONA = ['FISICA', 'JURIDICA'];

export class CreateSocioProtectorDto {
  @ApiProperty({ required: false, description: 'Si se omite, SIGBO sugiere el siguiente correlativo (SC001, SC002...)' })
  @IsOptional() @IsString() @MaxLength(20)
  codigo?: string;

  @ApiProperty({ enum: TIPOS_PERSONA }) @IsIn(TIPOS_PERSONA) tipoPersona: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id -- si el socio ya es Personal, no se duplica su registro' })
  @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) bomberoId?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) nombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) apellido?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) ci?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsISO8601() fechaNacimiento?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) razonSocial?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(30) ruc?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(200) nombreComercial?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(150) representanteNombre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) representanteCi?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) telefono?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) celular?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(255) email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(300) direccion?: string;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo PAIS)' }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) paisId?: string;
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo DEPARTAMENTO)' }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) departamentoId?: string;
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo CIUDAD)' }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) ciudadId?: string;
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo BARRIO)' }) @IsOptional() @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE }) barrioId?: string;

  @ApiProperty({ description: 'organizacion.parametros.id (tipo ESTADO_SOCIO_PROTECTOR)' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  estadoId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observaciones?: string;
}

export class UpdateSocioProtectorDto extends PartialType(CreateSocioProtectorDto) {
  @ApiProperty({ required: false, description: 'Motivo del cambio de codigo, si aplica -- se audita en el historial' })
  @IsOptional() @IsString()
  motivoCambioCodigo?: string;
}
