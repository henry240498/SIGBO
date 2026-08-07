import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

export class CreateBomberoDto {
  @ApiProperty() @IsString() @IsNotEmpty() cedula: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() apellido: string;
  @ApiProperty() @IsString() @IsNotEmpty() fechaNacimiento: string;

  @ApiProperty({ required: false, enum: ['M', 'F'] })
  @IsOptional()
  @IsIn(['M', 'F'])
  sexo?: 'M' | 'F';

  @ApiProperty() @IsString() @IsNotEmpty() telefonoPrincipal: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty() @IsString() @IsNotEmpty() numeroBombero: string;
  @ApiProperty() @IsString() @IsNotEmpty() rango: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiProperty() @IsString() @IsNotEmpty() fechaIngreso: string;

  @ApiProperty({
    enum: ['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'],
    default: 'ACTIVO',
  })
  @IsOptional()
  @IsIn(['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'])
  estado?: string;

  @ApiProperty({
    required: false,
    enum: ['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'],
  })
  @IsOptional()
  @IsIn(['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'])
  condicionInstitucional?: string;

  /* --- Integracion con Organizacion Institucional (todos opcionales) --- */
  @ApiProperty({ required: false, description: 'organizacion.rangos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  rangoId?: string;

  @ApiProperty({ required: false, description: 'organizacion.cargos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cargoPrincipalId?: string;

  @ApiProperty({ required: false, description: 'organizacion.companias.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  companiaId?: string;

  @ApiProperty({ required: false, description: 'organizacion.cuarteles.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  cuartelId?: string;

  @ApiProperty({ required: false, description: 'organizacion.turnos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  turnoId?: string;

  @ApiProperty({ required: false, description: 'organizacion.tipos_guardia.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoGuardiaId?: string;

  @ApiProperty({ required: false, description: 'organizacion.brigadas.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  brigadaId?: string;

  @ApiProperty({ required: false, description: 'organizacion.departamentos.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  departamentoId?: string;

  @ApiProperty({ required: false, description: 'organizacion.unidades.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  unidadId?: string;

  /* --- Ampliacion Modulo Personal --- */
  @ApiProperty({ required: false }) @IsOptional() @IsString() pais?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() barrio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() pasaporte?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaIncorporacion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaJuramento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() firmaDigitalUrl?: string;
}
