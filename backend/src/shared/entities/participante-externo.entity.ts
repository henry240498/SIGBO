import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Persona que participa de un evento sin pertenecer al cuerpo de bomberos
 * (civiles, estudiantes, invitados, personal de otras instituciones, etc.).
 * Nunca genera automaticamente un registro en personal.bomberos. */
@Entity({ name: 'participantes_externos', schema: 'operaciones' })
export class ParticipanteExterno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  cedula: string | null;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  apellido: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  celular: string | null;

  /** Institucion de procedencia del visitante (ej. "Colegio Nacional") -- NO
   * confundir con institucionId (multi-tenant de SIGBO, campo preparado). */
  @Column({ type: 'nvarchar', length: 150, nullable: true })
  institucionProcedencia: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
