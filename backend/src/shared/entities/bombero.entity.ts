import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoBombero =
  | 'ASPIRANTE'
  | 'ACTIVO'
  | 'SUSPENDIDO'
  | 'LICENCIA'
  | 'RETIRADO'
  | 'FALLECIDO'
  | 'HONORARIO';

export type CondicionInstitucional = 'INCORPORADO' | 'COMBATIENTE' | 'APOYO_ECONOMICO' | 'HONORARIO';

@Entity({ name: 'bomberos', schema: 'personal' })
export class Bombero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  cedula: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 100 })
  apellido: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ type: 'nvarchar', length: 1, nullable: true })
  sexo: 'M' | 'F' | null;

  @Column({ type: 'nvarchar', length: 50, default: 'Paraguaya' })
  nacionalidad: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  estadoCivil: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  lugarNacimiento: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  telefonoPrincipal: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  telefonoSecundario: string | null;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  direccion: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  departamento: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  codigoPostal: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  domicilioLat: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  domicilioLon: number | null;

  @Column({ type: 'nvarchar', length: 20 })
  numeroBombero: string;

  @Column({ type: 'nvarchar', length: 50 })
  rango: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  cargo: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  estado: EstadoBombero;

  @Column({ type: 'date' })
  fechaIngreso: string;

  @Column({ type: 'date', nullable: true })
  fechaAscenso: string | null;

  @Column({ type: 'int', insert: false, update: false, select: true, nullable: true })
  antiguedad: number | null;

  @Column({ type: 'nvarchar', length: 5, nullable: true })
  grupoSanguineo: string | null;

  @Column({ type: 'nvarchar', length: 2, nullable: true })
  factorRh: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  alergias: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  condicionesMedicas: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  medicamentos: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  tipoSeguro: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  numeroSeguro: string | null;

  @Column({ type: 'date', nullable: true })
  vigenciaSeguro: string | null;

  @Column({ type: 'nvarchar', default: '[]' })
  contactosEmergencia: string;

  @Column({ type: 'nvarchar', nullable: true })
  fotoUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  fotoThumbUrl: string | null;

  @Column({ type: 'date', nullable: true })
  fechaBaja: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoBaja: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;

  /* --- Integracion con Organizacion Institucional --- */
  @Column({ type: 'uniqueidentifier', nullable: true })
  rangoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cargoPrincipalId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  companiaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuartelId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  turnoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoGuardiaId: string | null;

  /* --- Expansion Modulo Personal --- */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  condicionInstitucional: CondicionInstitucional | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  brigadaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  departamentoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  unidadId: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true, default: 'Paraguay' })
  pais: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  barrio: string | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  pasaporte: string | null;

  @Column({ type: 'date', nullable: true })
  fechaIncorporacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaJuramento: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  firmaDigitalUrl: string | null;
}
