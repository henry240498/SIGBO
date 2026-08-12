import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const DIAS_SEMANA = ['NINGUNA', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

export class CreateBomberoDto {
  @ApiProperty() @IsString() @IsNotEmpty() cedula: string;
  @ApiProperty() @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty() @IsString() @IsNotEmpty() apellido: string;
  @ApiProperty() @IsString() @IsNotEmpty() fechaNacimiento: string;

  @ApiProperty({ required: false, enum: ['M', 'F'] })
  @IsOptional()
  @IsIn(['M', 'F'])
  sexo?: 'M' | 'F' | null;

  @ApiProperty({ required: false }) @IsOptional() @IsString() estadoCivil?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() lugarNacimiento?: string;

  @ApiProperty() @IsString() @IsNotEmpty() telefonoPrincipal: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telefonoSecundario?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() direccion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() codigoPostal?: string;

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

  @ApiProperty({ required: false, description: 'personal.tipos_bombero.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  tipoBomberoId?: string;

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

  @ApiProperty({ required: false, description: 'organizacion.departamentos.id (unidad organizacional)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  departamentoId?: string;

  @ApiProperty({ required: false, description: 'organizacion.unidades.id' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  unidadId?: string;

  /* --- Ubicacion: organizacion.parametros (jerarquia PAIS>DEPARTAMENTO>CIUDAD>BARRIO) --- */
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo PAIS)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  paisId?: string | null;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo DEPARTAMENTO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  departamentoResidenciaId?: string | null;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo CIUDAD)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  ciudadId?: string | null;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo BARRIO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  barrioId?: string | null;

  /* --- Salud: organizacion.parametros --- */
  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo GRUPO_SANGUINEO)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  grupoSanguineoId?: string | null;

  @ApiProperty({ required: false, description: 'organizacion.parametros.id (tipo FACTOR_RH)' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  factorRhId?: string | null;

  @ApiProperty({ required: false }) @IsOptional() @IsString() alergias?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() condicionesMedicas?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() medicamentos?: string;

  /* --- Ampliacion Modulo Personal --- */
  @ApiProperty({ required: false }) @IsOptional() @IsString() pasaporte?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaIncorporacion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fechaJuramento?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() firmaDigitalUrl?: string;

  /* --- Disponibilidad para Guardias (distinto de Servicios: un bombero
     puede participar de servicios aunque no realice guardias) --- */
  @ApiProperty({ required: false, default: true }) @IsOptional() @IsBoolean() realizaGuardias?: boolean;
  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() realizaGuardiasEspeciales?: boolean;
  @ApiProperty({ required: false, description: 'Cantidad de guardias normales por mes' })
  @IsOptional()
  @IsInt()
  frecuenciaNormalMensual?: number;

  @ApiProperty({ required: false, description: 'Cantidad de guardias especiales por mes' })
  @IsOptional()
  @IsInt()
  frecuenciaEspecialMensual?: number;

  @ApiProperty({ required: false, enum: DIAS_SEMANA, default: 'NINGUNA' })
  @IsOptional()
  @IsIn(DIAS_SEMANA)
  diaPreferenteGuardia?: string;
}
