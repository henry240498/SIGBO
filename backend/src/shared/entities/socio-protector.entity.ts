import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TipoPersonaSocio = 'FISICA' | 'JURIDICA';

/** Socio Protector: persona fisica, juridica, o un bombero existente
 * (vinculo explicito por bomberoId -- nunca se duplica el registro
 * de Personal). El codigo visible/editable (SC001) es independiente
 * del PK interno; sus cambios se auditan en SociosHistorialCodigo. */
@Entity({ name: 'socios_protectores', schema: 'finanzas' })
export class SocioProtector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoPersona: TipoPersonaSocio;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  /* --- Persona fisica (NULL cuando bomberoId esta seteado) --- */
  @Column({ type: 'nvarchar', length: 100, nullable: true })
  nombre: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  apellido: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  ci: string | null;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: string | null;

  /* --- Persona juridica --- */
  @Column({ type: 'nvarchar', length: 200, nullable: true })
  razonSocial: string | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  ruc: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  nombreComercial: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  representanteNombre: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  representanteCi: string | null;

  /* --- Contacto y ubicacion --- */
  @Column({ type: 'nvarchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  celular: string | null;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  direccion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  paisId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  departamentoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ciudadId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  barrioId: string | null;

  /** Referencia a organizacion.parametros (tipo ESTADO_SOCIO_PROTECTOR). */
  @Column({ type: 'uniqueidentifier' })
  estadoId: string;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
